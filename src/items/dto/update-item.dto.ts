import { IsOptional, IsUUID } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;
}
