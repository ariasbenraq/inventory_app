import { IsNumberString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  unitId?: string;
}
