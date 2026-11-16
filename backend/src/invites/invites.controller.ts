import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser, Public } from '../auth/auth.decorators';
import { parseDays } from '../common/parse-days';
import { OrgAccessService } from '../organizations/org-access.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { InvitesService } from './invites.service';

@Controller('organizations')
export class InvitesController {
  constructor(
    private invites: InvitesService,
    private access: OrgAccessService,
  ) {}

  // Role and location rules for inviting are checked in the service.
  @Post(':orgId/invite')
  invite(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.invites.inviteMember(orgId, user.id, dto);
  }

  // `?days=7` limits either list to invites sent in the last 7 days.
  @Get(':orgId/locations/:locationId/requests')
  async locationRequests(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('locationId') locationId: string,
    @Query('days') days?: string,
  ) {
    await this.access.assertCanManageLocation(orgId, locationId, user.id);
    return this.invites.getLocationRequests(orgId, locationId, parseDays(days));
  }

  @Get(':orgId/requests')
  orgRequests(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Query('days') days?: string,
  ) {
    return this.invites.getOrgRequests(orgId, user.id, parseDays(days));
  }

  // Public so the invite page can show org/location details before the
  // invitee has logged in. Possessing the token is the authorization.
  @Public()
  @Get('invites/:token')
  getInvite(@Param('token') token: string) {
    return this.invites.getInviteByToken(token);
  }

  @Post('invites/:token/accept')
  accept(@CurrentUser() user: User, @Param('token') token: string) {
    return this.invites.acceptInvite(token, user);
  }
}
