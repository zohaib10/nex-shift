import { IsISO8601, IsString } from 'class-validator';

/** Publishes every draft at the location that starts in [from, to). */
export class PublishShiftsDto {
  @IsString()
  locationId: string;

  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;
}
