import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
