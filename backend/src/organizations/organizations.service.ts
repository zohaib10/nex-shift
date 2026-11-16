import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  isOrgAdmin,
  normalizeLocationRole,
  normalizeOrgRole,
  type InviteRole,
  type LocationRole,
  type OrgRole,
} from './roles';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddLocationDto } from './dto/add-location.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { EmailService, escapeHtml } from '../email/email.service';
import * as crypto from 'crypto';

const STATE_TIMEZONES: Record<string, { timezone: string; label: string }> = {
  AL: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  AK: { timezone: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  AZ: { timezone: 'America/Phoenix', label: 'Mountain Standard Time (MST)' },
  AR: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  CA: { timezone: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  CO: { timezone: 'America/Denver', label: 'Mountain Time (MT)' },
  CT: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  DE: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  FL: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  GA: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  HI: { timezone: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  ID: { timezone: 'America/Boise', label: 'Mountain Time (MT)' },
  IL: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  IN: { timezone: 'America/Indiana/Indianapolis', label: 'Eastern Time (ET)' },
  IA: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  KS: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  KY: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  LA: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  ME: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  MD: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  MA: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  MI: { timezone: 'America/Detroit', label: 'Eastern Time (ET)' },
  MN: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  MS: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  MO: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  MT: { timezone: 'America/Denver', label: 'Mountain Time (MT)' },
  NE: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  NV: { timezone: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  NH: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  NJ: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  NM: { timezone: 'America/Denver', label: 'Mountain Time (MT)' },
  NY: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  NC: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  ND: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  OH: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  OK: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  OR: { timezone: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  PA: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  RI: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  SC: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  SD: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  TN: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  TX: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  UT: { timezone: 'America/Denver', label: 'Mountain Time (MT)' },
  VT: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  VA: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  WA: { timezone: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  WV: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  WI: { timezone: 'America/Chicago', label: 'Central Time (CT)' },
  WY: { timezone: 'America/Denver', label: 'Mountain Time (MT)' },
  DC: { timezone: 'America/New_York', label: 'Eastern Time (ET)' },
  PR: { timezone: 'America/Puerto_Rico', label: 'Atlantic Time (AT)' },
  GU: { timezone: 'Pacific/Guam', label: 'Chamorro Time (ChST)' },
};

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private email: EmailService,
  ) {}

  // ─── access checks ──────────────────────────────────────────────────────
  // Non-members get 404 (not 403) so they can't probe which org ids exist.

  /** The caller's org role, or 404 if they aren't in the organization. */
  async getOrgRole(orgId: string, userId: string): Promise<OrgRole> {
    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });
    if (!membership) throw new NotFoundException('Organization not found');
    return normalizeOrgRole(membership.role);
  }

  async assertOrgAdmin(orgId: string, userId: string): Promise<OrgRole> {
    const role = await this.getOrgRole(orgId, userId);
    if (!isOrgAdmin(role)) {
      throw new ForbiddenException('Only organization admins can do this');
    }
    return role;
  }

  /** Ids of the org's locations the user manages (all of them for admins). */
  private async managedLocationIds(orgId: string, userId: string, role: OrgRole) {
    if (isOrgAdmin(role)) {
      const all = await this.prisma.location.findMany({ where: { orgId }, select: { id: true } });
      return all.map((l) => l.id);
    }
    const rows = await this.prisma.locationMember.findMany({
      where: { userId, role: 'manager', location: { orgId } },
      select: { locationId: true },
    });
    return rows.map((r) => r.locationId);
  }

  /** Admins and owners manage every location; members only where they're a manager. */
  async assertCanManageLocation(orgId: string, locationId: string, userId: string) {
    const role = await this.getOrgRole(orgId, userId);
    const managed = await this.managedLocationIds(orgId, userId, role);
    if (!managed.includes(locationId)) {
      throw new ForbiddenException('Only managers of this location can do this');
    }
  }

  /**
   * Anyone can create their first organization. After that, only people who
   * are an owner or admin somewhere can create more; staff and managers can't.
   */
  async assertCanCreateOrg(userId: string) {
    const memberships = await this.prisma.orgMember.findMany({
      where: { userId },
      select: { role: true },
    });
    if (memberships.length > 0 && !memberships.some((m) => isOrgAdmin(normalizeOrgRole(m.role)))) {
      throw new ForbiddenException('Staff and managers can’t create organizations');
    }
  }

  async createOrg(userId: string, dto: CreateOrgDto) {
    await this.assertCanCreateOrg(userId);
    const org = await this.prisma.$transaction(async (tx) => {
      let maxMembers = 5;

      if (dto.promoId) {
        const promo = await tx.promoCode.findUnique({
          where: { id: dto.promoId },
        });
        if (!promo || !promo.active) {
          throw new BadRequestException('Invalid promo code');
        }
        if (promo.maxUses > 0 && promo.usesCount >= promo.maxUses) {
          throw new BadRequestException(
            'Promo code has reached its usage limit',
          );
        }
        if (promo.expiresAt && promo.expiresAt < new Date()) {
          throw new BadRequestException('Promo code has expired');
        }
        maxMembers = promo.maxMembers;
      }

      const organization = await tx.organization.create({
        data: {
          name: dto.name,
          type: dto.type,
          typeOther: dto.typeOther,
          phone: dto.phone,
          website: dto.website,
          ownerId: userId,
          maxMembers,
        },
      });

      await tx.location.create({
        data: {
          orgId: organization.id,
          name: dto.locationName,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          timezone: dto.timezone,
        },
      });

      await tx.orgMember.create({
        data: {
          orgId: organization.id,
          userId,
          role: 'owner',
        },
      });

      if (dto.promoId) {
        await tx.promoCode.update({
          where: { id: dto.promoId },
          data: { usesCount: { increment: 1 } },
        });
      }

      return organization;
    });

    if (dto.inviteEmails && dto.inviteEmails.length > 0) {
      await Promise.allSettled(
        dto.inviteEmails.map((email) =>
          this.supabase.getClient().auth.admin.inviteUserByEmail(email, {
            data: { org_id: org.id, role: 'user' },
          }),
        ),
      );
    }

    return org;
  }

  async validatePromo(code: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return { valid: false, message: 'Invalid promo code' };
    }

    if (!promo.active) {
      return { valid: false, message: 'This promo code is no longer active' };
    }

    if (promo.maxUses > 0 && promo.usesCount >= promo.maxUses) {
      return {
        valid: false,
        message: 'This promo code has reached its maximum uses',
      };
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { valid: false, message: 'This promo code has expired' };
    }

    return {
      valid: true,
      promoId: promo.id,
      maxMembers: promo.maxMembers,
    };
  }

  getTimezone(state: string) {
    const entry = STATE_TIMEZONES[state.toUpperCase()];
    if (!entry) {
      throw new NotFoundException(
        `No timezone mapping found for state: ${state}`,
      );
    }
    return entry;
  }

  /**
   * The user's organizations with their role. Admins and owners get every
   * location (as manager); members get only the locations they belong to.
   */
  async getUserOrgs(userId: string) {
    const [memberships, locationRows] = await Promise.all([
      this.prisma.orgMember.findMany({
        where: { userId },
        include: {
          org: {
            select: {
              id: true,
              name: true,
              locations: {
                select: { id: true, name: true },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.locationMember.findMany({
        where: { userId },
        select: { locationId: true, role: true },
      }),
    ]);
    const locationRole = new Map(locationRows.map((r) => [r.locationId, normalizeLocationRole(r.role)]));

    return memberships.map((m) => {
      const role = normalizeOrgRole(m.role);
      const locations = isOrgAdmin(role)
        ? m.org.locations.map((l) => ({ ...l, role: 'manager' as LocationRole }))
        : m.org.locations
            .filter((l) => locationRole.has(l.id))
            .map((l) => ({ ...l, role: locationRole.get(l.id)! }));
      return { id: m.org.id, name: m.org.name, role, locations };
    });
  }

  // ─── team ───────────────────────────────────────────────────────────────

  async listMembers(orgId: string) {
    const [members, locationRows] = await Promise.all([
      this.prisma.orgMember.findMany({ where: { orgId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.locationMember.findMany({
        where: { location: { orgId } },
        select: { userId: true, role: true, location: { select: { id: true, name: true } } },
        orderBy: { location: { createdAt: 'asc' } },
      }),
    ]);
    // org_members.user_id has no FK relation yet, so users are fetched separately.
    const users = await this.prisma.user.findMany({
      where: { id: { in: members.map((m) => m.userId) } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userById = new Map(users.map((u) => [u.id, u]));

    return members.map((m) => {
      const u = userById.get(m.userId);
      return {
        userId: m.userId,
        firstName: u?.firstName ?? '',
        lastName: u?.lastName ?? '',
        email: u?.email ?? '',
        role: normalizeOrgRole(m.role),
        joinedAt: m.createdAt,
        locations: locationRows
          .filter((r) => r.userId === m.userId)
          .map((r) => ({ ...r.location, role: normalizeLocationRole(r.role) })),
      };
    });
  }

  /**
   * Admins and owners can change a member's locations. Only the owner can
   * promote someone to admin or demote an admin, and the owner can't be edited.
   */
  async updateMember(orgId: string, actorId: string, targetId: string, dto: UpdateMemberDto) {
    const actorRole = await this.assertOrgAdmin(orgId, actorId);
    const target = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: targetId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    const targetRole = normalizeOrgRole(target.role);

    if (targetRole === 'owner') {
      throw new ForbiddenException("The owner's access can't be changed");
    }
    const changingRole = dto.role !== undefined && dto.role !== targetRole;
    if ((changingRole || targetRole === 'admin') && actorRole !== 'owner') {
      throw new ForbiddenException('Only the owner can change admin access');
    }

    if (dto.locations) {
      const ids = [...new Set(dto.locations.map((l) => l.locationId))];
      const found = await this.prisma.location.count({ where: { orgId, id: { in: ids } } });
      if (found !== ids.length) throw new NotFoundException('One or more locations not found');
    }

    await this.prisma.$transaction(async (tx) => {
      if (changingRole) {
        await tx.orgMember.update({ where: { id: target.id }, data: { role: dto.role } });
      }
      if (dto.locations) {
        const keep = dto.locations.map((l) => l.locationId);
        await tx.locationMember.deleteMany({
          where: { userId: targetId, location: { orgId }, locationId: { notIn: keep } },
        });
        for (const l of dto.locations) {
          await tx.locationMember.upsert({
            where: { locationId_userId: { locationId: l.locationId, userId: targetId } },
            create: { locationId: l.locationId, userId: targetId, role: l.role },
            update: { role: l.role },
          });
        }
      }
    });

    const members = await this.listMembers(orgId);
    return members.find((m) => m.userId === targetId);
  }

  async removeMember(orgId: string, actorId: string, targetId: string) {
    const actorRole = await this.assertOrgAdmin(orgId, actorId);
    const target = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: targetId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    const targetRole = normalizeOrgRole(target.role);

    if (targetRole === 'owner') throw new ForbiddenException("The owner can't be removed");
    if (targetRole === 'admin' && actorRole !== 'owner') {
      throw new ForbiddenException('Only the owner can remove an admin');
    }

    await this.prisma.$transaction([
      this.prisma.locationMember.deleteMany({ where: { userId: targetId, location: { orgId } } }),
      this.prisma.orgMember.delete({ where: { id: target.id } }),
    ]);
    return { success: true };
  }

  async addLocation(orgId: string, dto: AddLocationDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.location.create({
      data: {
        orgId,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        timezone: dto.timezone,
      },
      select: { id: true, name: true },
    });
  }

  /**
   * Admins and owners can invite as staff, manager or admin, to any location.
   * Managers can invite only staff, and only to locations they manage.
   */
  async inviteMember(orgId: string, invitedById: string, dto: InviteMemberDto) {
    const inviteRole: InviteRole = dto.role ?? 'staff';
    const inviterRole = await this.getOrgRole(orgId, invitedById);

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
      const managed = await this.managedLocationIds(orgId, invitedById, inviterRole);
      if (!locationIds.every((id) => managed.includes(id))) {
        throw new ForbiddenException('You can only invite people to locations you manage');
      }
    }

    // Check for an existing pending (non-expired) invite for this email at any of the requested locations
    const existing = await this.prisma.memberRequest.findFirst({
      where: {
        orgId,
        email: dto.email.toLowerCase(),
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

    // Check they aren't already a member of any requested location
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (user) {
      const orgMember = await this.prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId, userId: user.id } },
      });
      if (orgMember && (inviteRole === 'admin' || isOrgAdmin(normalizeOrgRole(orgMember.role)))) {
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

    // One shared token across the batch — a single accept action grants every location at once
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const requests = await this.prisma.$transaction(
      locationIds.map((locationId) =>
        this.prisma.memberRequest.create({
          data: {
            orgId,
            locationId,
            email: dto.email.toLowerCase(),
            invitedById,
            role: inviteRole,
            token,
            expiresAt,
          },
        }),
      ),
    );

    await this.sendInviteEmail({
      to: dto.email,
      token,
      locationNames: locations.map((l) => l.name),
      orgName: org.name,
      role: inviteRole,
    });

    return { requests, locations };
  }

  private async sendInviteEmail({
    to,
    token,
    locationNames,
    orgName,
    role,
  }: {
    to: string;
    token: string;
    locationNames: string[];
    orgName: string;
    role: InviteRole;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const acceptLink = `${frontendUrl}/invite?token=${token}`;
    const locationLabel =
      locationNames.length > 1
        ? `${locationNames.slice(0, -1).join(', ')} and ${locationNames[locationNames.length - 1]}`
        : locationNames[0];
    // Admins join the whole organization, so the email names the org, not locations.
    const what =
      role === 'admin'
        ? { text: `${orgName} as an admin`, html: `<strong>${escapeHtml(orgName)}</strong> as an admin` }
        : {
            text: `${locationLabel} (${orgName}) as ${role === 'manager' ? 'a manager' : 'a staff member'}`,
            html: `<strong>${escapeHtml(locationLabel)}</strong> (${escapeHtml(orgName)}) as ${role === 'manager' ? 'a manager' : 'a staff member'}`,
          };

    try {
      await this.email.send({
        to,
        subject: `You've been invited to join ${orgName} on NexShift`,
        text: `You've been invited to join ${what.text} on NexShift.\n\nAccept the invitation: ${acceptLink}\n\nThis invitation expires in 7 days.`,
        html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h1 style="color: #07090E; margin-bottom: 8px;">You're invited</h1>
          <p>You've been invited to join ${what.html} on NexShift.</p>
          <p style="margin: 32px 0;">
            <a href="${acceptLink}" style="background-color: #00D48A; color: #07090E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #999; font-size: 13px;">This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.</p>
        </div>
      `,
      });
    } catch (error) {
      // The invite rows exist either way; the admin can resend.
      console.error('Failed to send invite email:', error);
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
        data: { status: 'accepted', respondedAt: new Date(), acceptedByUserId: userId },
      });

      const existing = await tx.orgMember.findUnique({
        where: { orgId_userId: { orgId: first.orgId, userId } },
      });
      if (!existing) {
        await tx.orgMember.create({
          data: { orgId: first.orgId, userId, role: inviteRole === 'admin' ? 'admin' : 'member' },
        });
      } else if (inviteRole === 'admin' && normalizeOrgRole(existing.role) === 'member') {
        await tx.orgMember.update({ where: { id: existing.id }, data: { role: 'admin' } });
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

  private readonly requestSelect = {
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

  /** Only invites sent in the last `days` days, when given. */
  private sinceFilter(days?: number) {
    return days ? { createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } } : {};
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
      ...new Set(requests.filter((r) => r.status === 'accepted' && !r.acceptedBy).map((r) => r.email)),
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
      acceptedBy: r.status !== 'accepted' ? null : (acceptedBy ?? name(byEmail.get(r.email))),
      invitedBy: name(byId.get(invitedById)),
    }));
  }

  async getLocationRequests(orgId: string, locationId: string, days?: number) {
    const location = await this.prisma.location.findFirst({
      where: { id: locationId, orgId },
    });
    if (!location) throw new NotFoundException('Location not found');

    const requests = await this.prisma.memberRequest.findMany({
      where: { locationId, orgId, ...this.sinceFilter(days) },
      orderBy: { createdAt: 'desc' },
      select: this.requestSelect,
    });
    return this.withNames(requests);
  }

  /** Admins see every invite; managers see invites for locations they manage. */
  async getOrgRequests(orgId: string, userId: string, days?: number) {
    const role = await this.getOrgRole(orgId, userId);
    const managed = await this.managedLocationIds(orgId, userId, role);
    if (!isOrgAdmin(role) && managed.length === 0) {
      throw new ForbiddenException('Only admins and managers can see invites');
    }

    const requests = await this.prisma.memberRequest.findMany({
      where: {
        orgId,
        ...(isOrgAdmin(role) ? {} : { locationId: { in: managed } }),
        ...this.sinceFilter(days),
      },
      orderBy: { createdAt: 'desc' },
      select: this.requestSelect,
    });
    return this.withNames(requests);
  }

  async hasMembership(userId: string) {
    const membership = await this.prisma.orgMember.findFirst({
      where: { userId },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            locations: {
              select: { id: true, name: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });
    return {
      hasMembership: !!membership,
      organization: membership
        ? {
            id: membership.org.id,
            name: membership.org.name,
            locations: membership.org.locations,
          }
        : null,
    };
  }
}
