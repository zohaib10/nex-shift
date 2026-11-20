import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  locationId: string;

  /** Omit for an open shift. */
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsISO8601()
  startsAt: string;

  @IsISO8601()
  endsAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
