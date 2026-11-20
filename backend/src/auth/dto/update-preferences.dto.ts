import { IsArray, IsIn, IsOptional } from 'class-validator';
import { DASHBOARD_CARDS, type DashboardCard } from '../preferences';

export class UpdatePreferencesDto {
  /** Replaces the full list of hidden cards. */
  @IsOptional()
  @IsArray()
  @IsIn(DASHBOARD_CARDS, { each: true })
  hiddenDashboardCards?: DashboardCard[];
}
