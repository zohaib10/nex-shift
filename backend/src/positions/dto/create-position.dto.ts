import { IsString, Length } from 'class-validator';

/** The colour is assigned by the system. */
export class CreatePositionDto {
  @IsString()
  @Length(1, 40)
  name: string;
}
