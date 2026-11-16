import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/auth.decorators';
import { OrgAccessService } from '../organizations/org-access.service';
import { AddLocationDto } from './dto/add-location.dto';
import { LocationsService } from './locations.service';

@Controller('organizations')
export class LocationsController {
  constructor(
    private locations: LocationsService,
    private access: OrgAccessService,
  ) {}

  @Get('timezone')
  getTimezone(@Query('state') state: string) {
    if (!state)
      throw new BadRequestException('state query parameter is required');
    return this.locations.getTimezone(state);
  }

  @Post(':orgId/locations')
  async addLocation(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: AddLocationDto,
  ) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.locations.addLocation(orgId, dto);
  }
}
