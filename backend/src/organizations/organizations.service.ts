import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddLocationDto } from './dto/add-location.dto';

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
  ) {}

  async createOrg(dto: CreateOrgDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const org = await this.prisma.$transaction(async (tx) => {
      let maxMembers = 5;

      if (dto.promoId) {
        const promo = await tx.promoCode.findUnique({ where: { id: dto.promoId } });
        if (!promo || !promo.active) {
          throw new BadRequestException('Invalid promo code');
        }
        if (promo.maxUses > 0 && promo.usesCount >= promo.maxUses) {
          throw new BadRequestException('Promo code has reached its usage limit');
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
          ownerId: dto.userId,
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
          userId: dto.userId,
          role: 'admin',
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
      return { valid: false, message: 'This promo code has reached its maximum uses' };
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
      throw new NotFoundException(`No timezone mapping found for state: ${state}`);
    }
    return entry;
  }

  async getUserOrgs(userId: string) {
    const memberships = await this.prisma.orgMember.findMany({
      where: { userId },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            locations: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({ ...m.org, role: m.role }));
  }

  async addLocation(orgId: string, dto: AddLocationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
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

  async hasMembership(userId: string) {
    const membership = await this.prisma.orgMember.findFirst({
      where: { userId },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            locations: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
    return {
      hasMembership: !!membership,
      organization: membership
        ? { id: membership.org.id, name: membership.org.name, locations: membership.org.locations }
        : null,
    };
  }
}
