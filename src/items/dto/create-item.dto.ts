import { IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @Type(() => String)
  @IsNumberString()
  unitId!: string;
}
