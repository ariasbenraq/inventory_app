import { ArrayNotEmpty, IsArray, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestItemDto } from './request-item.dto';

export class CreateRequestDto {
  @IsNumberString()
  ministryId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  items!: RequestItemDto[];
}
