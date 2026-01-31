import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Request } from './request.entity';
import { RequestItem } from './request-item.entity';
import { Ministry } from '../ministries/ministry.entity';
import { Item } from '../items/item.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UnitsService } from '../units/units.service';
import { RequestStatus } from './request-status.enum';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestDetailDto } from './dto/request-detail.dto';
import { RequestItemDto } from './dto/request-item.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(RequestItem)
    private readonly requestItemsRepository: Repository<RequestItem>,
    @InjectRepository(Ministry)
    private readonly ministriesRepository: Repository<Ministry>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly unitsService: UnitsService,
  ) {}

  async createRequest(userId: string, dto: CreateRequestDto): Promise<Request> {
    const ministry = await this.ministriesRepository.findOne({
      where: { id: dto.ministryId },
    });

    if (!ministry) {
      throw new NotFoundException('Ministry not found');
    }

    const items = await this.itemsRepository.find({
      where: { id: In(dto.items.map((item) => item.itemId)) },
    });

    if (items.length !== dto.items.length) {
      throw new BadRequestException('Invalid items in request');
    }

    return this.dataSource.transaction(async (manager) => {
      const request = this.requestsRepository.create({
        createdBy: { id: userId },
        ministry,
        status: RequestStatus.PENDING,
      });

      const savedRequest = await manager.save(request);

      const requestItems = await Promise.all(
        dto.items.map(async (item) => {
          const factor = await this.unitsService.getUnitFactor(item.unitId);
          const quantity = item.quantity * factor;
          return this.requestItemsRepository.create({
            request: savedRequest,
            item: { id: item.itemId },
            unit: { id: item.unitId },
            quantity,
          });
        }),
      );

      await manager.save(requestItems);
      return savedRequest;
    });
  }

  async updateRequest(
    userId: string,
    requestId: string,
    dto: UpdateRequestDto,
  ): Promise<RequestDetailDto> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId, createdBy: { id: userId } },
      relations: ['items', 'items.item', 'items.unit'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    const ministry = dto.ministryId
      ? await this.ministriesRepository.findOne({ where: { id: dto.ministryId } })
      : null;

    if (dto.ministryId && !ministry) {
      throw new NotFoundException('Ministry not found');
    }

    if (dto.items) {
      await this.validateRequestItems(dto.items);
    }

    await this.dataSource.transaction(async (manager) => {
      if (ministry) {
        request.ministry = ministry;
      }

      await manager.save(request);

      if (!dto.items) {
        return;
      }

      const existingItems = new Map<string, RequestItem>();
      for (const existingItem of request.items ?? []) {
        const itemId =
          (existingItem.item as Item)?.id ??
          (existingItem.item as unknown as string);
        const unitId =
          existingItem.unit?.id ?? (existingItem.unit as unknown as string);
        existingItems.set(`${itemId}:${unitId}`, existingItem);
      }

      for (const item of dto.items) {
        const factor = await this.unitsService.getUnitFactor(item.unitId);
        const quantity = item.quantity * factor;
        const key = `${item.itemId}:${item.unitId}`;
        const existing = existingItems.get(key);

        if (existing) {
          existing.quantity = quantity;
          await manager.save(existing);
        } else {
          const created = this.requestItemsRepository.create({
            request,
            item: { id: item.itemId },
            unit: { id: item.unitId },
            quantity,
          });
          await manager.save(created);
        }
      }
    });

    const updated = await this.getRequestById(requestId, true);
    return this.mapRequest(updated, true);
  }

  async cancelRequest(userId: string, requestId: string): Promise<RequestDetailDto> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId, createdBy: { id: userId } },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    request.status = RequestStatus.CANCELLED;
    const saved = await this.requestsRepository.save(request);
    const loaded = await this.getRequestById(saved.id, true);
    return this.mapRequest(loaded, true);
  }

  async confirmReceived(
    userId: string,
    requestId: string,
  ): Promise<RequestDetailDto> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId, createdBy: { id: userId } },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.FULFILLED) {
      throw new BadRequestException('Only fulfilled requests can be confirmed');
    }

    request.status = RequestStatus.CONFIRMED;
    await this.requestsRepository.save(request);
    const loaded = await this.getRequestById(requestId, true);
    return this.mapRequest(loaded, true);
  }

  async getMyRequests(userId: string): Promise<RequestDetailDto[]> {
    const requests = await this.requestsRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['items', 'items.item', 'items.unit', 'ministry'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.mapRequest(request));
  }

  async getAllRequests(): Promise<RequestDetailDto[]> {
    const requests = await this.requestsRepository.find({
      relations: ['items', 'items.item', 'items.unit', 'ministry', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.mapRequest(request, true));
  }

  async fulfillRequest(requestId: string, adminUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT fulfill_request($1, $2)', [
        requestId,
        adminUserId,
      ]);
    });
  }

  private async validateRequestItems(items: RequestItemDto[]): Promise<void> {
    const itemIds = items.map((item) => item.itemId);
    const uniqueItemIds = Array.from(new Set(itemIds));
    const dbItems = await this.itemsRepository.find({
      where: { id: In(uniqueItemIds) },
    });

    if (dbItems.length !== uniqueItemIds.length) {
      throw new BadRequestException('Invalid items in request');
    }

    for (const item of items) {
      await this.unitsService.getUnitFactor(item.unitId);
    }
  }

  private async getRequestById(
    requestId: string,
    includeCreatedBy: boolean,
  ): Promise<Request> {
    return this.requestsRepository.findOneOrFail({
      where: { id: requestId },
      relations: includeCreatedBy
        ? ['items', 'items.item', 'items.unit', 'ministry', 'createdBy']
        : ['items', 'items.item', 'items.unit', 'ministry'],
    });
  }

  private mapRequest(
    request: Request,
    includeCreatedBy = false,
  ): RequestDetailDto {
    return {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
      ministryId: request.ministry?.id ?? '',
      createdById: includeCreatedBy ? request.createdBy?.id : undefined,
      items: (request.items ?? []).map((item) => ({
        itemId: Number((item.item as Item)?.id ?? item.item),
        unitId: Number(item.unit?.id ?? item.unit),
        quantity: Number(item.quantity),
      })),
    };
  }
}
