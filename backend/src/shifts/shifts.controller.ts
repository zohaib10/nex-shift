import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/auth.decorators';
import { parseDateRange } from '../common/parse-date-range';
import { OrgAccessService } from '../organizations/org-access.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { MarkNoShowDto } from './dto/mark-no-show.dto';
import { PublishShiftsDto } from './dto/publish-shifts.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('organizations')
export class ShiftsController {
  constructor(
    private shifts: ShiftsService,
    private access: OrgAccessService,
  ) {}

  // What each caller sees depends on their role at the location (see the service).
  @Get(':orgId/shifts')
  list(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.shifts.list(
      orgId,
      user.id,
      parseDateRange(from, to),
      locationId,
    );
  }

  @Get(':orgId/locations/:locationId/roster')
  async roster(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('locationId') locationId: string,
  ) {
    await this.access.assertCanManageLocation(orgId, locationId, user.id);
    return this.shifts.roster(orgId, locationId);
  }

  @Post(':orgId/shifts')
  async create(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: CreateShiftDto,
  ) {
    await this.access.assertCanManageLocation(orgId, dto.locationId, user.id);
    return this.shifts.create(orgId, user.id, dto);
  }

  @Post(':orgId/shifts/publish')
  async publish(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: PublishShiftsDto,
  ) {
    await this.access.assertCanManageLocation(orgId, dto.locationId, user.id);
    const { from, to } = parseDateRange(dto.from, dto.to);
    return this.shifts.publish(orgId, dto.locationId, from, to);
  }

  // The shift's location decides access, so the check is in the service.
  @Patch(':orgId/shifts/:shiftId')
  update(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shifts.update(orgId, user.id, shiftId, dto);
  }

  @Post(':orgId/shifts/:shiftId/cancel')
  cancel(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('shiftId') shiftId: string,
  ) {
    return this.shifts.cancel(orgId, user.id, shiftId);
  }

  @Patch(':orgId/shifts/:shiftId/no-show')
  setNoShow(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: MarkNoShowDto,
  ) {
    return this.shifts.setNoShow(orgId, user.id, shiftId, dto.noShow);
  }

  @Delete(':orgId/shifts/:shiftId')
  remove(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('shiftId') shiftId: string,
  ) {
    return this.shifts.remove(orgId, user.id, shiftId);
  }
}
