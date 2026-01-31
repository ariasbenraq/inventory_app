import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Request } from './request.entity';
import { RequestItem } from './request-item.entity';
import { Ministry } from '../ministries/ministry.entity';
import { Item } from '../items/item.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UnitsService } from '../units/units.service';
import { RequestStatus } from './request-status.enum';

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

  async fulfillRequest(requestId: string, adminUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT fulfill_request($1, $2)', [
        requestId,
        adminUserId,
      ]);
    });
  }
}
