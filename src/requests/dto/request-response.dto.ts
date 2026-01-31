import { RequestStatus } from '../request-status.enum';

export class RequestResponseDto {
  id!: string;
  status!: RequestStatus;
  createdAt!: Date;
}
