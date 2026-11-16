import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
import { AddLocationDto } from './dto/add-location.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CurrentUser, Public } from '../auth/auth.decorators';

function parseDays(days?: string): number | undefined {
  if (days === undefined) return undefined;
  const n = Number(days);
  if (!Number.isInteger(n) || n < 1 || n > 3650) {
    throw new BadRequestException('days must be a whole number from 1 to 3650');
  }
  return n;
}

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateOrgDto) {
    return this.organizationsService.createOrg(user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-promo')
  async validatePromo(@Body() dto: ValidatePromoDto) {
    return this.organizationsService.validatePromo(dto.code);
  }

  @Get('timezone')
  async getTimezone(@Query('state') state: string) {
    if (!state) {
      throw new BadRequestException('state query parameter is required');
    }
    return this.organizationsService.getTimezone(state);
  }

  @Get('mine')
  async getMyOrgs(@CurrentUser() user: User) {
    return this.organizationsService.getUserOrgs(user.id);
  }

  @Get('membership')
  async hasMembership(@CurrentUser() user: User) {
    return this.organizationsService.hasMembership(user.id);
  }

  @Post(':orgId/locations')
  async addLocation(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: AddLocationDto,
  ) {
    await this.organizationsService.assertOrgAdmin(orgId, user.id);
    return this.organizationsService.addLocation(orgId, dto);
  }

  // Role and location checks for invites live in the service.
  @Post(':orgId/invite')
  async inviteMember(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(orgId, user.id, dto);
  }

  // `?days=7` limits either list to invites sent in the last 7 days.
  @Get(':orgId/locations/:locationId/requests')
  async getLocationRequests(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('locationId') locationId: string,
    @Query('days') days?: string,
  ) {
    await this.organizationsService.assertCanManageLocation(orgId, locationId, user.id);
    return this.organizationsService.getLocationRequests(orgId, locationId, parseDays(days));
  }

  @Get(':orgId/requests')
  async getOrgRequests(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Query('days') days?: string,
  ) {
    return this.organizationsService.getOrgRequests(orgId, user.id, parseDays(days));
  }

  @Get(':orgId/members')
  async listMembers(@CurrentUser() user: User, @Param('orgId') orgId: string) {
    await this.organizationsService.assertOrgAdmin(orgId, user.id);
    return this.organizationsService.listMembers(orgId);
  }

  @Patch(':orgId/members/:userId')
  async updateMember(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.organizationsService.updateMember(orgId, user.id, userId, dto);
  }

  @Delete(':orgId/members/:userId')
  async removeMember(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationsService.removeMember(orgId, user.id, userId);
  }

  // Public so the invite page can show org/location details before the
  // invitee has logged in. Possessing the token is the authorization.
  @Public()
  @Get('invites/:token')
  async getInvite(@Param('token') token: string) {
    return this.organizationsService.getInviteByToken(token);
  }

  @Post('invites/:token/accept')
  async acceptInvite(@CurrentUser() user: User, @Param('token') token: string) {
    return this.organizationsService.acceptInvite(token, user);
  }
}
