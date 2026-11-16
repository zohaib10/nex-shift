import { IsString, IsEmail, IsArray, ArrayNotEmpty, IsIn, IsOptional } from 'class-validator';
import { INVITE_ROLES, type InviteRole } from '../roles';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  locationIds: string[];

  /** Defaults to staff. Managers can only invite staff. */
  @IsOptional()
  @IsIn(INVITE_ROLES)
  role?: InviteRole;
}
