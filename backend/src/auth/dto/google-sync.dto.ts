import { IsEmail, IsString, IsOptional } from 'class-validator';

export class GoogleSyncDto {
  @IsString()
  supabaseId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
