import {
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  brandId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brandName?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @Type(() => String)
  @IsNumberString()
  unitId!: string;
}
