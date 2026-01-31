import { IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryInDto {
  @IsUUID()
  itemId!: string;

  @IsUUID()
  unitId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity!: number;
}
