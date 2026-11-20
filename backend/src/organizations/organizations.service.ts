import { BadRequestException, Injectable } from '@nestjs/common';
import { seedPositions } from '../positions/default-positions';
import { PrismaService } from '../prisma/prisma.service';
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
    private access: OrgAccessService,
  ) {}

  /**
   * Creates the org, its first location, the owner's membership and default
   * positions. Returns the org with that location; onboarding then sends its
   * invites through POST /organizations/:orgId/invite like any other invite.
   */
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

      const location = await tx.location.create({
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

      await tx.position.createMany({
        data: seedPositions(dto.type).map((p) => ({
          ...p,
          orgId: organization.id,
        })),
      });

      if (dto.promoId) {
        await tx.promoCode.update({
          where: { id: dto.promoId },
          data: { usesCount: { increment: 1 } },
        });
      }

      return {
        ...organization,
        locations: [{ id: location.id, name: location.name }],
      };
    });

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
                select: { id: true, name: true, timezone: true },
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
