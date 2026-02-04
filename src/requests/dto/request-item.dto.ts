import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  unitId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity!: number;
}
