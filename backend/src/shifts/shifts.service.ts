import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrgAccessService } from '../organizations/org-access.service';
import {
  isOrgAdmin,
  normalizeLocationRole,
  normalizeOrgRole,
} from '../organizations/roles';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { MAX_SHIFT_HOURS, VISIBLE_TO_STAFF } from './shift-status';

const SHIFT_SELECT = {
  id: true,
  locationId: true,
  userId: true,
  positionId: true,
  startsAt: true,
  endsAt: true,
  notes: true,
  status: true,
  cancelledAt: true,
  noShowAt: true,
  user: { select: { id: true, firstName: true, lastName: true } },
  position: { select: { id: true, name: true, color: true } },
} as const;

/** The fields a shift is checked on, after an update is applied. */
interface ShiftDraft {
  id?: string;
  orgId: string;
  locationId: string;
  userId: string | null;
  positionId: string | null;
  startsAt: Date;
  endsAt: Date;
}

/** Shifts at a location, and who can be scheduled there. */
@Injectable()
export class ShiftsService {
  constructor(
    private prisma: PrismaService,
    private access: OrgAccessService,
  ) {}

  /**
   * Shifts overlapping [from, to). Managers and admins get every shift at the
   * locations they manage; everyone gets their own published and cancelled shifts.
   */
  async list(
    orgId: string,
    userId: string,
    range: { from: Date; to: Date },
    locationId?: string,
  ) {
    const role = await this.access.getOrgRole(orgId, userId);
    const managed = await this.access.managedLocationIds(orgId, userId, role);
    const own: Prisma.ShiftWhereInput = {
      userId,
      status: { in: VISIBLE_TO_STAFF },
    };

    let scope: Prisma.ShiftWhereInput;
    if (locationId && managed.includes(locationId)) {
      scope = { locationId };
    } else if (locationId) {
      const member = await this.prisma.locationMember.findUnique({
        where: { locationId_userId: { locationId, userId } },
      });
      if (!member) throw new NotFoundException('Location not found');
      scope = { locationId, ...own };
    } else {
      scope = { OR: [{ locationId: { in: managed } }, own] };
    }

    return this.prisma.shift.findMany({
      where: {
        orgId,
        startsAt: { lt: range.to },
        endsAt: { gt: range.from },
        ...scope,
      },
      select: SHIFT_SELECT,
      orderBy: { startsAt: 'asc' },
    });
  }

  /**
   * People who can be scheduled at a location: its staff and managers, plus the
   * org's admins (who work everywhere). `isAdmin` lets the grid hide admins
   * who have no shifts.
   */
  async roster(orgId: string, locationId: string) {
    const [locationRows, adminRows, positionRows] = await Promise.all([
      this.prisma.locationMember.findMany({
        where: { locationId },
        select: { userId: true, role: true },
      }),
      this.prisma.orgMember.findMany({
        where: { orgId, role: { in: ['owner', 'admin'] } },
        select: { userId: true },
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

    const roleByUser = new Map<string, 'admin' | 'manager' | 'staff'>();
    for (const r of locationRows)
      roleByUser.set(r.userId, normalizeLocationRole(r.role));
    for (const a of adminRows) roleByUser.set(a.userId, 'admin');

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...roleByUser.keys()] }, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return users.map((u) => ({
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: roleByUser.get(u.id)!,
      positions: positionRows
        .filter((p) => p.userId === u.id)
        .map((p) => p.position),
    }));
  }

  async create(orgId: string, createdById: string, dto: CreateShiftDto) {
    const draft: ShiftDraft = {
      orgId,
      locationId: dto.locationId,
      userId: dto.userId ?? null,
      positionId: dto.positionId ?? null,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    };
    await this.validate(draft);
    return this.prisma.shift.create({
      data: {
        ...draft,
        notes: dto.notes?.trim() || null,
        createdById,
      },
      select: SHIFT_SELECT,
    });
  }

  /** Editing a published shift keeps it published. Cancelled shifts can't be edited. */
  async update(
    orgId: string,
    actorId: string,
    shiftId: string,
    dto: UpdateShiftDto,
  ) {
    const shift = await this.findManaged(orgId, actorId, shiftId);
    if (shift.status === 'cancelled') {
      throw new BadRequestException("A cancelled shift can't be edited");
    }
    const draft: ShiftDraft = {
      id: shift.id,
      orgId,
      locationId: shift.locationId,
      userId: dto.userId === undefined ? shift.userId : dto.userId,
      positionId:
        dto.positionId === undefined ? shift.positionId : dto.positionId,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : shift.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : shift.endsAt,
    };
    await this.validate(draft);
    return this.prisma.shift.update({
      where: { id: shift.id },
      data: {
        userId: draft.userId,
        positionId: draft.positionId,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        ...(dto.notes !== undefined
          ? { notes: dto.notes?.trim() || null }
          : {}),
      },
      select: SHIFT_SELECT,
    });
  }

  async remove(orgId: string, actorId: string, shiftId: string) {
    const shift = await this.findManaged(orgId, actorId, shiftId);
    await this.prisma.shift.delete({ where: { id: shift.id } });
    return { success: true };
  }

  /** Published shifts are cancelled, not deleted, so the assignee sees it. Drafts are just deleted. */
  async cancel(orgId: string, actorId: string, shiftId: string) {
    const shift = await this.findManaged(orgId, actorId, shiftId);
    if (shift.status !== 'published') {
      throw new BadRequestException('Only published shifts can be cancelled');
    }
    if (shift.endsAt <= new Date()) {
      throw new BadRequestException("A shift that's over can't be cancelled");
    }
    return this.prisma.shift.update({
      where: { id: shift.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
      select: SHIFT_SELECT,
    });
  }

  /** Mark (or unmark) that the assignee didn't turn up. Only once the shift has started. */
  async setNoShow(
    orgId: string,
    actorId: string,
    shiftId: string,
    noShow: boolean,
  ) {
    const shift = await this.findManaged(orgId, actorId, shiftId);
    if (shift.status !== 'published' || !shift.userId) {
      throw new BadRequestException(
        'Only a published shift with someone assigned can be a no-show',
      );
    }
    if (noShow && shift.startsAt > new Date()) {
      throw new BadRequestException(
        "A shift can't be a no-show before it starts",
      );
    }
    return this.prisma.shift.update({
      where: { id: shift.id },
      data: { noShowAt: noShow ? new Date() : null },
      select: SHIFT_SELECT,
    });
  }

  async publish(orgId: string, locationId: string, from: Date, to: Date) {
    const { count } = await this.prisma.shift.updateMany({
      where: {
        orgId,
        locationId,
        status: 'draft',
        startsAt: { gte: from, lt: to },
      },
      data: { status: 'published' },
    });
    return { published: count };
  }

  /** The shift, if the caller manages its location. 404 otherwise. */
  private async findManaged(orgId: string, actorId: string, shiftId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, orgId },
    });
    if (!shift) throw new NotFoundException('Shift not found');
    await this.access.assertCanManageLocation(orgId, shift.locationId, actorId);
    return shift;
  }

  private async validate(s: ShiftDraft) {
    if (isNaN(s.startsAt.getTime()) || isNaN(s.endsAt.getTime())) {
      throw new BadRequestException('Enter a valid start and end time');
    }
    if (s.endsAt <= s.startsAt) {
      throw new BadRequestException('The shift must end after it starts');
    }
    if (s.endsAt.getTime() - s.startsAt.getTime() > MAX_SHIFT_HOURS * 3.6e6) {
      throw new BadRequestException(
        `A shift can be at most ${MAX_SHIFT_HOURS} hours`,
      );
    }

    const location = await this.prisma.location.findFirst({
      where: { id: s.locationId, orgId: s.orgId },
    });
    if (!location) throw new NotFoundException('Location not found');

    if (s.positionId) {
      const position = await this.prisma.position.findFirst({
        where: { id: s.positionId, orgId: s.orgId },
      });
      if (!position) throw new NotFoundException('Position not found');
    }

    if (!s.userId) return;
    const user = await this.prisma.user.findUnique({
      where: { id: s.userId },
      select: { firstName: true },
    });
    const name = user?.firstName || 'This person';
    await this.assertWorksAt(s, name);

    if (s.positionId) {
      const qualified = await this.prisma.memberPosition.findUnique({
        where: {
          positionId_userId: { positionId: s.positionId, userId: s.userId },
        },
      });
      if (!qualified) {
        throw new BadRequestException(
          `${name} isn't set up for this position. Add it on the Team page first.`,
        );
      }
    }

    const overlap = await this.prisma.shift.findFirst({
      where: {
        orgId: s.orgId,
        userId: s.userId,
        status: { not: 'cancelled' },
        startsAt: { lt: s.endsAt },
        endsAt: { gt: s.startsAt },
        ...(s.id ? { id: { not: s.id } } : {}),
      },
    });
    if (overlap) {
      throw new ConflictException(
        `${name} already has a shift that overlaps this time`,
      );
    }
  }

  /** The assignee must work at the location, or be an org admin. */
  private async assertWorksAt(s: ShiftDraft, name: string) {
    const [orgMember, locationMember] = await Promise.all([
      this.prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId: s.orgId, userId: s.userId! } },
      }),
      this.prisma.locationMember.findUnique({
        where: {
          locationId_userId: { locationId: s.locationId, userId: s.userId! },
        },
      }),
    ]);
    if (!orgMember) throw new NotFoundException('Member not found');
    if (!locationMember && !isOrgAdmin(normalizeOrgRole(orgMember.role))) {
      throw new ForbiddenException(`${name} doesn't work at this location`);
    }
  }
}
