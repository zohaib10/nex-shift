import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/auth.decorators';
import { OrgAccessService } from '../organizations/org-access.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@Controller('organizations')
export class MembersController {
  constructor(
    private members: MembersService,
    private access: OrgAccessService,
  ) {}

  @Get(':orgId/members')
  async list(@CurrentUser() user: User, @Param('orgId') orgId: string) {
    await this.access.assertOrgAdmin(orgId, user.id);
    return this.members.listMembers(orgId);
  }

  // Role rules (owner-only changes to admins) are checked in the service.
  @Patch(':orgId/members/:userId')
  update(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.members.updateMember(orgId, user.id, userId, dto);
  }

  @Delete(':orgId/members/:userId')
  remove(
    @CurrentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.members.removeMember(orgId, user.id, userId);
  }
}
