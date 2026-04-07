import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
import { AddLocationDto } from './dto/add-location.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(@Body() dto: CreateOrgDto) {
    return this.organizationsService.createOrg(dto);
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

  @Post(':orgId/locations')
  async addLocation(@Param('orgId') orgId: string, @Body() dto: AddLocationDto) {
    return this.organizationsService.addLocation(orgId, dto);
  }

  @Get('user/:userId')
  async getUserOrgs(@Param('userId') userId: string) {
    return this.organizationsService.getUserOrgs(userId);
  }

  @Get('has-membership/:userId')
  async hasMembership(@Param('userId') userId: string) {
    return this.organizationsService.hasMembership(userId);
  }
}
