import { IsBoolean } from 'class-validator';

export class MarkNoShowDto {
  /** false clears a no-show marked by mistake. */
  @IsBoolean()
  noShow: boolean;
}
