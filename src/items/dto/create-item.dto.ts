import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => String)
  @IsNumberString()
  unitId!: string;
}
