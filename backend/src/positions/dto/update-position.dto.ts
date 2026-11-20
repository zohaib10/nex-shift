import { IsString, Length } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  @Length(1, 40)
  name: string;
}
