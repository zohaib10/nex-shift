import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/auth.decorators';
import { OrgAccessService } from '../organizations/org-access.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsService } from './positions.service';

@Controller('organizations')
export class PositionsController {
  constructor(
    private positions: PositionsService,
    private access: OrgAccessService,
  ) {}

  // Any member: managers pick positions on shifts, staff see them.
  @Get(':orgId/positions')
  async list(@CurrentUser() user: User, @Param('orgId') orgId: string) {
    await this.access.getOrgRole(orgId, user.id);
    return this.positions.list(orgId);
  }

  @Get(':orgId/positions/suggestions')
  async suggestions(@CurrentUser() user: User, @Param('orgId') orgId: string) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.positions.suggestions(orgId);
  }

  @Post(':orgId/positions')
  async create(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: CreatePositionDto,
  ) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.positions.create(orgId, dto);
  }

  @Patch(':orgId/positions/:positionId')
  async update(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('positionId') positionId: string,
    @Body() dto: UpdatePositionDto,
  ) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.positions.update(orgId, positionId, dto);
  }

  @Delete(':orgId/positions/:positionId')
  async remove(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('positionId') positionId: string,
  ) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.positions.remove(orgId, positionId);
  }
}
