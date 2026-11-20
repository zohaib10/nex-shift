import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrgAccessService } from '../organizations/org-access.service';
import {
  normalizeLocationRole,
  normalizeOrgRole,
} from '../organizations/roles';
import { UpdateMemberDto } from './dto/update-member.dto';

/** The Team page: everyone in an organization and their access. */
@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private access: OrgAccessService,
  ) {}

  async listMembers(orgId: string) {
    const [members, locationRows, positionRows] = await Promise.all([
      this.prisma.orgMember.findMany({
        where: { orgId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.locationMember.findMany({
        where: { location: { orgId } },
        select: {
          userId: true,
          role: true,
          location: { select: { id: true, name: true } },
        },
        orderBy: { location: { createdAt: 'asc' } },
      }),
      this.prisma.memberPosition.findMany({
        where: { position: { orgId } },
        select: {
          userId: true,
          position: { select: { id: true, name: true, color: true } },
        },
        orderBy: { position: { name: 'asc' } },
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
        positions: positionRows
          .filter((r) => r.userId === m.userId)
          .map((r) => r.position),
      };
    });
  }

  /**
   * Admins and owners can change a member's locations. Only the owner can
   * promote someone to admin or demote an admin, and the owner can't be edited.
   */
  async updateMember(
    orgId: string,
    actorId: string,
    targetId: string,
    dto: UpdateMemberDto,
  ) {
    const actorRole = await this.access.assertOrgAdmin(orgId, actorId);
    const target = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: targetId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    const targetRole = normalizeOrgRole(target.role);

    // Positions are not access: any admin can set them, for anyone.
    const changingAccess =
      dto.role !== undefined || dto.locations !== undefined;
    if (changingAccess && targetRole === 'owner') {
      throw new ForbiddenException("The owner's access can't be changed");
    }
    const changingRole = dto.role !== undefined && dto.role !== targetRole;
    if (
      changingAccess &&
      (changingRole || targetRole === 'admin') &&
      actorRole !== 'owner'
    ) {
      throw new ForbiddenException('Only the owner can change admin access');
    }

    if (dto.locations) {
      const ids = [...new Set(dto.locations.map((l) => l.locationId))];
      const found = await this.prisma.location.count({
        where: { orgId, id: { in: ids } },
      });
      if (found !== ids.length)
        throw new NotFoundException('One or more locations not found');
    }

    const positionIds = dto.positionIds && [...new Set(dto.positionIds)];
    if (positionIds) {
      const found = await this.prisma.position.count({
        where: { orgId, id: { in: positionIds } },
      });
      if (found !== positionIds.length)
        throw new NotFoundException('One or more positions not found');
    }

    await this.prisma.$transaction(async (tx) => {
      if (positionIds) {
        await tx.memberPosition.deleteMany({
          where: { userId: targetId, position: { orgId } },
        });
        await tx.memberPosition.createMany({
          data: positionIds.map((positionId) => ({
            positionId,
            userId: targetId,
          })),
        });
      }
      if (changingRole) {
        await tx.orgMember.update({
          where: { id: target.id },
          data: { role: dto.role },
        });
      }
      if (dto.locations) {
        const keep = dto.locations.map((l) => l.locationId);
        await tx.locationMember.deleteMany({
          where: {
            userId: targetId,
            location: { orgId },
            locationId: { notIn: keep },
          },
        });
        for (const l of dto.locations) {
          await tx.locationMember.upsert({
            where: {
              locationId_userId: { locationId: l.locationId, userId: targetId },
            },
            create: {
              locationId: l.locationId,
              userId: targetId,
              role: l.role,
            },
            update: { role: l.role },
          });
        }
      }
    });

    const members = await this.listMembers(orgId);
    return members.find((m) => m.userId === targetId);
  }

  async removeMember(orgId: string, actorId: string, targetId: string) {
    const actorRole = await this.access.assertOrgAdmin(orgId, actorId);
    const target = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: targetId } },
    });
    if (!target) throw new NotFoundException('Member not found');
    const targetRole = normalizeOrgRole(target.role);

    if (targetRole === 'owner')
      throw new ForbiddenException("The owner can't be removed");
    if (targetRole === 'admin' && actorRole !== 'owner') {
      throw new ForbiddenException('Only the owner can remove an admin');
    }

    await this.prisma.$transaction([
      this.prisma.locationMember.deleteMany({
        where: { userId: targetId, location: { orgId } },
      }),
      this.prisma.orgMember.delete({ where: { id: target.id } }),
    ]);
    return { success: true };
  }
}
