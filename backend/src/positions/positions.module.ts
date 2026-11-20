import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
