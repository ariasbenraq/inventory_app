import { ArrayNotEmpty, IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateRequestItemDto {
  @IsString()
  itemId!: string;

  @IsString()
  unitId!: string;

  @IsNumber()
  quantity!: number;
}

export class CreateRequestDto {
  @IsString()
  ministryId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  items!: CreateRequestItemDto[];
}
