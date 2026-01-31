import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryMovement, InventoryMovementType } from './inventory-movement.entity';
import { Item } from '../items/item.entity';
import { UnitsService } from '../units/units.service';
import { InventoryInDto } from './dto/inventory-in.dto';
import { InventoryOutDto } from './dto/inventory-out.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(InventoryMovement)
    private readonly movementsRepository: Repository<InventoryMovement>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly unitsService: UnitsService,
  ) {}

  async registerInventoryIn(
    dto: InventoryInDto,
  ): Promise<InventoryMovement> {
    const item = await this.itemsRepository.findOne({ where: { id: dto.itemId } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (!item.isActive) {
      throw new BadRequestException('Item is disabled');
    }

    const factor = await this.unitsService.getUnitFactor(dto.unitId);
    const quantity = dto.quantity * factor;

    const movement = this.movementsRepository.create({
      item: { id: dto.itemId },
      movementType: InventoryMovementType.IN,
      quantity,
    });

    return this.movementsRepository.save(movement);
  }

  async registerInventoryOut(
    userId: string,
    dto: InventoryOutDto,
  ): Promise<void> {
    const item = await this.itemsRepository.findOne({ where: { id: dto.itemId } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (!item.isActive) {
      throw new BadRequestException('Item is disabled');
    }

    const factor = await this.unitsService.getUnitFactor(dto.unitId);
    const quantity = dto.quantity * factor;

    const functionName =
      this.configService.get<string>('INVENTORY_OUT_FUNCTION') ?? 'inventory_out';

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
      throw new BadRequestException('Invalid inventory out function name');
    }

    await this.dataSource.query(`SELECT ${functionName}($1, $2, $3)`, [
      dto.itemId,
      quantity,
      userId,
    ]);
  }

  async getMovements(
    query: DateRangeQueryDto,
  ): Promise<InventoryMovement[]> {
    const qb = this.movementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.item', 'item')
      .orderBy('movement.createdAt', 'DESC');

    if (query.from) {
      qb.andWhere('movement.createdAt >= :from', {
        from: new Date(query.from),
      });
    }

    if (query.to) {
      qb.andWhere('movement.createdAt <= :to', {
        to: new Date(query.to),
      });
    }

    return qb.getMany();
  }
}
