import { RequestStatus } from '../request-status.enum';

export class RequestDetailItemDto {
  itemId!: string;
  unitId!: string;
  quantity!: number;
}

export class RequestDetailDto {
  id!: string;
  status!: RequestStatus;
  createdAt!: Date;
  ministryId!: string;
  createdById?: string;
  items!: RequestDetailItemDto[];
}
