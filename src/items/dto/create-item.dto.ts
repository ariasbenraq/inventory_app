import { IsUUID } from 'class-validator';

export class CreateItemDto {
  @IsUUID()
  unitId!: string;
}
