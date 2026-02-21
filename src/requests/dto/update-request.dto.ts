import { ArrayNotEmpty, IsArray, IsOptional, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestItemDto } from './request-item.dto';

export class UpdateRequestDto {
  @IsOptional()
  @IsNumberString()
  ministryId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  items?: RequestItemDto[];
}
