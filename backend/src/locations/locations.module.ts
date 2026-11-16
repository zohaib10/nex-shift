import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
