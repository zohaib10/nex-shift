import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { defaultPositions, nextColor } from './default-positions';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

const SELECT = { id: true, name: true, color: true } as const;

/** The jobs people can be scheduled as (RN, CNA, Front desk…), per organization. */
@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  list(orgId: string) {
    return this.prisma.position.findMany({
      where: { orgId },
      select: SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async create(orgId: string, dto: CreatePositionDto) {
    const existing = await this.prisma.position.findMany({
      where: { orgId },
      select: { color: true },
    });
    const color = nextColor(existing.map((p) => p.color));
    return this.unique(() =>
      this.prisma.position.create({
        data: { orgId, name: dto.name.trim(), color },
        select: SELECT,
      }),
    );
  }

  /** Defaults for the org's type that it doesn't have yet, for one-click adding. */
  async suggestions(orgId: string) {
    const [org, existing] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { type: true },
      }),
      this.prisma.position.findMany({
        where: { orgId },
        select: { name: true },
      }),
    ]);
    const have = new Set(existing.map((p) => p.name.toLowerCase()));
    return defaultPositions(org?.type ?? '').filter(
      (name) => !have.has(name.toLowerCase()),
    );
  }

  async update(orgId: string, positionId: string, dto: UpdatePositionDto) {
    await this.find(orgId, positionId);
    return this.unique(() =>
      this.prisma.position.update({
        where: { id: positionId },
        data: { name: dto.name.trim() },
        select: SELECT,
      }),
    );
  }

  /** Shifts that used it keep their times and lose the position. */
  async remove(orgId: string, positionId: string) {
    await this.find(orgId, positionId);
    await this.prisma.position.delete({ where: { id: positionId } });
    return { success: true };
  }

  private async find(orgId: string, positionId: string) {
    const position = await this.prisma.position.findFirst({
      where: { id: positionId, orgId },
    });
    if (!position) throw new NotFoundException('Position not found');
    return position;
  }

  private async unique<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('A position with that name already exists');
      }
      throw e;
    }
  }
}
