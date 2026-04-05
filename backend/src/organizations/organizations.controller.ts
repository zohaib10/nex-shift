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

  @Get('has-membership/:userId')
  async hasMembership(@Param('userId') userId: string) {
    return this.organizationsService.hasMembership(userId);
  }
}
