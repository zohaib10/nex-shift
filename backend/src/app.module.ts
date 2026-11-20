import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LocationsModule } from './locations/locations.module';
import { InvitesModule } from './invites/invites.module';
import { MembersModule } from './members/members.module';
import { PositionsModule } from './positions/positions.module';
import { ShiftsModule } from './shifts/shifts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Infrastructure (global providers)
    PrismaModule,
    SupabaseModule,
    EmailModule,
    // Domains
    AuthModule,
    OrganizationsModule,
    LocationsModule,
    InvitesModule,
    MembersModule,
    PositionsModule,
    ShiftsModule,
  ],
})
export class AppModule {}
