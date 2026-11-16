import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrgAccessService } from './org-access.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrgAccessService],
  // Locations, invites and members modules use these access checks.
  exports: [OrgAccessService],
})
export class OrganizationsModule {}
