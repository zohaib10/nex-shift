import { BadRequestException } from '@nestjs/common';

const MAX_DAYS = 62;

/** Parses required `?from=&to=` ISO timestamps; `to` after `from`, at most 62 days apart. */
export function parseDateRange(from?: string, to?: string) {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new BadRequestException('from and to must be ISO dates');
  }
  if (end <= start) throw new BadRequestException('to must be after from');
  if (end.getTime() - start.getTime() > MAX_DAYS * 86_400_000) {
    throw new BadRequestException(`A range can be at most ${MAX_DAYS} days`);
  }
  return { from: start, to: end };
}
