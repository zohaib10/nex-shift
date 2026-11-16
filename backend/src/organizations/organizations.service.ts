import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { OrgAccessService } from './org-access.service';
import {
  isOrgAdmin,
  normalizeLocationRole,
  normalizeOrgRole,
  type LocationRole,
} from './roles';

/** Organizations themselves: creating one (with promo codes) and listing the user's. */
@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private access: OrgAccessService,
  ) {}

  async createOrg(userId: string, dto: CreateOrgDto) {
    await this.access.assertCanCreateOrg(userId);
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
    const locationRole = new Map(
      locationRows.map((r) => [r.locationId, normalizeLocationRole(r.role)]),
    );

    return memberships.map((m) => {
      const role = normalizeOrgRole(m.role);
      const locations = isOrgAdmin(role)
        ? m.org.locations.map((l) => ({
            ...l,
            role: 'manager' as LocationRole,
          }))
        : m.org.locations
            .filter((l) => locationRole.has(l.id))
            .map((l) => ({ ...l, role: locationRole.get(l.id)! }));
      return { id: m.org.id, name: m.org.name, role, locations };
    });
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
