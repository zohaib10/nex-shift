import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

/** Only the fields sent change. `null` clears userId (open shift), positionId or notes. */
export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsString()
  positionId?: string | null;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
