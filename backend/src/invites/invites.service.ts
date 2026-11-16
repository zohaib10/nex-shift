import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { inviteEmail } from '../email/templates/invite.email';
import { OrgAccessService } from '../organizations/org-access.service';
import {
  isOrgAdmin,
  normalizeOrgRole,
  type InviteRole,
} from '../organizations/roles';
import { InviteMemberDto } from './dto/invite-member.dto';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** What the invite lists return for each invite (before names are added). */
const REQUEST_SELECT = {
  id: true,
  email: true,
  role: true,
  status: true,
  expiresAt: true,
  respondedAt: true,
  createdAt: true,
  invitedById: true,
  location: { select: { id: true, name: true } },
  acceptedBy: { select: { firstName: true, lastName: true } },
} as const;

/**
 * Invites ("member requests"). Inviting one email to several locations writes
 * one row per location sharing a token, so one accept grants all of them.
 */
@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private access: OrgAccessService,
  ) {}

  /**
   * Admins and owners can invite as staff, manager or admin, to any location.
   * Managers can invite only staff, and only to locations they manage.
   */
  async inviteMember(orgId: string, invitedById: string, dto: InviteMemberDto) {
    const inviteRole: InviteRole = dto.role ?? 'staff';
    const inviterRole = await this.access.getOrgRole(orgId, invitedById);

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const locationIds = [...new Set(dto.locationIds)];
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds }, orgId },
      select: { id: true, name: true },
    });
    if (locations.length !== locationIds.length) {
      throw new NotFoundException('One or more locations not found');
    }

    if (!isOrgAdmin(inviterRole)) {
      if (inviteRole !== 'staff') {
        throw new ForbiddenException('Managers can only invite staff');
      }
      const managed = await this.access.managedLocationIds(
        orgId,
        invitedById,
        inviterRole,
      );
      if (!locationIds.every((id) => managed.includes(id))) {
        throw new ForbiddenException(
          'You can only invite people to locations you manage',
        );
      }
    }

    const email = dto.email.toLowerCase();
    await this.assertNotAlreadyInvited(orgId, email, locationIds, inviteRole);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const requests = await this.prisma.$transaction(
      locationIds.map((locationId) =>
        this.prisma.memberRequest.create({
          data: {
            orgId,
            locationId,
            email,
            invitedById,
            role: inviteRole,
            token,
            expiresAt,
          },
        }),
      ),
    );

    try {
      await this.email.send({
        to: dto.email,
        ...inviteEmail({
          token,
          orgName: org.name,
          locationNames: locations.map((l) => l.name),
          role: inviteRole,
        }),
      });
    } catch (error) {
      // The invite rows exist either way; the admin can resend.
      console.error('Failed to send invite email:', error);
    }

    return { requests, locations };
  }

  /** No duplicate pending invite, and not already in the org/locations being offered. */
  private async assertNotAlreadyInvited(
    orgId: string,
    email: string,
    locationIds: string[],
    inviteRole: InviteRole,
  ) {
    const existing = await this.prisma.memberRequest.findFirst({
      where: {
        orgId,
        email,
        locationId: { in: locationIds },
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) {
      throw new ConflictException(
        'A pending invite already exists for this email at one of the selected locations',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const orgMember = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
    });
    if (
      orgMember &&
      (inviteRole === 'admin' || isOrgAdmin(normalizeOrgRole(orgMember.role)))
    ) {
      throw new ConflictException(
        'This person is already in the organization. Change their access from the Team page.',
      );
    }
    const alreadyMember = await this.prisma.locationMember.findFirst({
      where: { userId: user.id, locationId: { in: locationIds } },
    });
    if (alreadyMember) {
      throw new ConflictException(
        'This person is already at one of the selected locations. Change their role from the Team page.',
      );
    }
  }

  async getInviteByToken(token: string) {
    const requests = await this.prisma.memberRequest.findMany({
      where: { token },
      include: {
        location: { select: { id: true, name: true } },
        org: { select: { id: true, name: true } },
      },
    });

    if (requests.length === 0) throw new NotFoundException('Invite not found');
    const [first] = requests;
    const locations = requests.map((r) => r.location);

    if (first.status !== 'pending') {
      return { ...first, locations, invalid: true, reason: first.status };
    }
    if (new Date() > first.expiresAt) {
      await this.prisma.memberRequest.updateMany({
        where: { token },
        data: { status: 'expired' },
      });
      return {
        ...first,
        locations,
        status: 'expired',
        invalid: true,
        reason: 'expired',
      };
    }

    return { ...first, locations, invalid: false };
  }

  async acceptInvite(token: string, user: User) {
    const userId = user.id;
    const requests = await this.prisma.memberRequest.findMany({
      where: { token },
    });

    if (requests.length === 0) throw new NotFoundException('Invite not found');
    const [first] = requests;
    if (first.email !== user.email.toLowerCase()) {
      throw new ForbiddenException(
        `This invite was sent to ${first.email}. Log in with that email to accept it.`,
      );
    }
    if (first.status !== 'pending') {
      throw new BadRequestException(`Invite is already ${first.status}`);
    }
    if (new Date() > first.expiresAt) {
      await this.prisma.memberRequest.updateMany({
        where: { token },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invite has expired');
    }

    const inviteRole = (first.role ?? 'staff') as InviteRole;

    // Accepting only ever adds access: an existing admin isn't demoted, and an
    // existing manager isn't turned back into staff.
    await this.prisma.$transaction(async (tx) => {
      await tx.memberRequest.updateMany({
        where: { token },
        data: {
          status: 'accepted',
          respondedAt: new Date(),
          acceptedByUserId: userId,
        },
      });

      const existing = await tx.orgMember.findUnique({
        where: { orgId_userId: { orgId: first.orgId, userId } },
      });
      if (!existing) {
        await tx.orgMember.create({
          data: {
            orgId: first.orgId,
            userId,
            role: inviteRole === 'admin' ? 'admin' : 'member',
          },
        });
      } else if (
        inviteRole === 'admin' &&
        normalizeOrgRole(existing.role) === 'member'
      ) {
        await tx.orgMember.update({
          where: { id: existing.id },
          data: { role: 'admin' },
        });
      }

      // Admins manage every location, so they don't get location rows.
      if (inviteRole !== 'admin') {
        for (const r of requests) {
          await tx.locationMember.upsert({
            where: { locationId_userId: { locationId: r.locationId, userId } },
            create: { locationId: r.locationId, userId, role: inviteRole },
            update: inviteRole === 'manager' ? { role: 'manager' } : {},
          });
        }
      }
    });

    return { orgId: first.orgId, role: inviteRole };
  }

  async getLocationRequests(orgId: string, locationId: string, days?: number) {
    const location = await this.prisma.location.findFirst({
      where: { id: locationId, orgId },
    });
    if (!location) throw new NotFoundException('Location not found');

    const requests = await this.prisma.memberRequest.findMany({
      where: { locationId, orgId, ...sinceFilter(days) },
      orderBy: { createdAt: 'desc' },
      select: REQUEST_SELECT,
    });
    return this.withNames(requests);
  }

  /** Admins see every invite; managers see invites for locations they manage. */
  async getOrgRequests(orgId: string, userId: string, days?: number) {
    const role = await this.access.getOrgRole(orgId, userId);
    const managed = await this.access.managedLocationIds(orgId, userId, role);
    if (!isOrgAdmin(role) && managed.length === 0) {
      throw new ForbiddenException('Only admins and managers can see invites');
    }

    const requests = await this.prisma.memberRequest.findMany({
      where: {
        orgId,
        ...(isOrgAdmin(role) ? {} : { locationId: { in: managed } }),
        ...sinceFilter(days),
      },
      orderBy: { createdAt: 'desc' },
      select: REQUEST_SELECT,
    });
    return this.withNames(requests);
  }

  /**
   * Adds who accepted each invite and who sent it. Acceptance comes from the
   * acceptedBy relation; invites accepted before that column existed fall
   * back to matching the invited email. invited_by_id has no FK yet, so
   * inviters are looked up in the same extra query.
   */
  private async withNames<
    T extends {
      email: string;
      status: string;
      invitedById: string;
      acceptedBy: { firstName: string; lastName: string } | null;
    },
  >(requests: T[]) {
    const emails = [
      ...new Set(
        requests
          .filter((r) => r.status === 'accepted' && !r.acceptedBy)
          .map((r) => r.email),
      ),
    ];
    const inviterIds = [...new Set(requests.map((r) => r.invitedById))];
    const users = await this.prisma.user.findMany({
      where: { OR: [{ email: { in: emails } }, { id: { in: inviterIds } }] },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
    const byId = new Map(users.map((u) => [u.id, u]));
    const name = (u?: { firstName: string; lastName: string }) =>
      u ? { firstName: u.firstName, lastName: u.lastName } : null;

    return requests.map(({ invitedById, acceptedBy, ...r }) => ({
      ...r,
      acceptedBy:
        r.status !== 'accepted'
          ? null
          : (acceptedBy ?? name(byEmail.get(r.email))),
      invitedBy: name(byId.get(invitedById)),
    }));
  }
}

/** Only invites sent in the last `days` days, when given. */
function sinceFilter(days?: number) {
  return days
    ? { createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } }
    : {};
}
