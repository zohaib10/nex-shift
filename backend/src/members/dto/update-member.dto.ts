import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LOCATION_ROLES, type LocationRole } from '../../organizations/roles';

export class LocationAssignmentDto {
  @IsString()
  locationId: string;

  @IsIn(LOCATION_ROLES)
  role: LocationRole;
}

export class UpdateMemberDto {
  /** Only the owner can promote to or demote from admin. */
  @IsOptional()
  @IsIn(['admin', 'member'])
  role?: 'admin' | 'member';

  /** Replaces the member's full set of locations in this organization. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationAssignmentDto)
  locations?: LocationAssignmentDto[];
}
