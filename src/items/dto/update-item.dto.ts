import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from '../item-type.enum';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  unitId?: string;

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

  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;
}
