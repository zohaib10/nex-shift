import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isOrgAdmin, normalizeOrgRole, type OrgRole } from './roles';

/**
 * Who can do what inside an organization. Every org-scoped endpoint goes
 * through one of these checks before touching data.
 *
 * Non-members get 404 (not 403) so they can't probe which org ids exist.
 */
@Injectable()
export class OrgAccessService {
  constructor(private prisma: PrismaService) {}

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
  async managedLocationIds(
    orgId: string,
    userId: string,
    role: OrgRole,
  ): Promise<string[]> {
    if (isOrgAdmin(role)) {
      const all = await this.prisma.location.findMany({
        where: { orgId },
        select: { id: true },
      });
      return all.map((l) => l.id);
    }
    const rows = await this.prisma.locationMember.findMany({
      where: { userId, role: 'manager', location: { orgId } },
      select: { locationId: true },
    });
    return rows.map((r) => r.locationId);
  }

  /** Admins and owners manage every location; members only where they're a manager. */
  async assertCanManageLocation(
    orgId: string,
    locationId: string,
    userId: string,
  ) {
    const role = await this.getOrgRole(orgId, userId);
    const managed = await this.managedLocationIds(orgId, userId, role);
    if (!managed.includes(locationId)) {
      throw new ForbiddenException(
        'Only managers of this location can do this',
      );
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
    if (
      memberships.length > 0 &&
      !memberships.some((m) => isOrgAdmin(normalizeOrgRole(m.role)))
    ) {
      throw new ForbiddenException(
        'Staff and managers can’t create organizations',
      );
    }
  }
}
