import { BadRequestException } from '@nestjs/common';

/** Parses an optional `?days=` query param: a whole number from 1 to 3650. */
export function parseDays(days?: string): number | undefined {
  if (days === undefined) return undefined;
  const n = Number(days);
  if (!Number.isInteger(n) || n < 1 || n > 3650) {
    throw new BadRequestException('days must be a whole number from 1 to 3650');
  }
  return n;
}
