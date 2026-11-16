import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddLocationDto } from './dto/add-location.dto';
import { STATE_TIMEZONES } from './timezones';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  getTimezone(state: string) {
    const entry = STATE_TIMEZONES[state.toUpperCase()];
    if (!entry) {
      throw new NotFoundException(
        `No timezone mapping found for state: ${state}`,
      );
    }
    return entry;
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
}
