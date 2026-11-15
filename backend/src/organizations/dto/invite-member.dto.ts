import { IsString, IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  invitedById: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  locationIds: string[];
}
