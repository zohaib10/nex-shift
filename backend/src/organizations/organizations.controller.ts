import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/auth.decorators';
import { CreateOrgDto } from './dto/create-org.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
import { OrganizationsService } from './organizations.service';

// Locations, invites and members live in their own modules under the same
// /organizations path; see locations/, invites/ and members/.
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizations: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateOrgDto) {
    return this.organizations.createOrg(user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-promo')
  validatePromo(@Body() dto: ValidatePromoDto) {
    return this.organizations.validatePromo(dto.code);
  }

  @Get('mine')
  getMyOrgs(@CurrentUser() user: User) {
    return this.organizations.getUserOrgs(user.id);
  }

  @Get('membership')
  hasMembership(@CurrentUser() user: User) {
    return this.organizations.hasMembership(user.id);
  }
}
