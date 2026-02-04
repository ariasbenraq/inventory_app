import { IsNumber, IsNumberString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryInDto {
  @Type(() => String)
  @IsNumberString()
  itemId!: string;

  @Type(() => String)
  @IsNumberString()
  unitId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity!: number;
}
