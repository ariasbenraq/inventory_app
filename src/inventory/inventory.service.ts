import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { InventoryMovement, InventoryMovementType } from './inventory-movement.entity';
import { Item } from '../items/item.entity';
import { UnitsService } from '../units/units.service';
import { InventoryInDto } from './dto/inventory-in.dto';
import { InventoryOutDto } from './dto/inventory-out.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';

type DashboardSummary = {
  totalMovements: number;
  totalInQuantity: number;
  totalOutQuantity: number;
  uniqueItems: number;
};

type TopItemMetric = {
  itemId: string;
  name: string;
  movementsCount: number;
  inQuantity: number;
  outQuantity: number;
};

type RawMetricsSummary = {
  totalMovements: string;
  totalInQuantity: string;
  totalOutQuantity: string;
  uniqueItems: string;
};

type RawTopItemMetric = {
  itemId: string;
  name: string;
  movementsCount: string;
  inQuantity: string;
  outQuantity: string;
};

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
    userId: string,
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
      itemId: dto.itemId,
      item: { id: dto.itemId },
      performedBy: userId,
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

    const configuredFunction =
      this.configService.get<string>('INVENTORY_OUT_FUNCTION') ?? 'public.inventory_out';

    const functionReference = this.getSafeFunctionReference(configuredFunction);
    const functionExists = await this.functionExists(functionReference);

    if (!functionExists) {
      throw new BadRequestException(
        'Inventory out function not found. Configure INVENTORY_OUT_FUNCTION with an existing function name/schema in database.',
      );
    }

    await this.dataSource.query(`SELECT ${functionReference}($1, $2, $3)`, [
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

    this.applyDateRange(qb, query);

    return qb.getMany();
  }

  async getDashboardMetrics(
    query: DashboardMetricsQueryDto,
  ): Promise<{
    range: { from?: string; to?: string };
    summary: DashboardSummary;
    topItems: TopItemMetric[];
  }> {
    const baseQuery = this.movementsRepository
      .createQueryBuilder('movement')
      .leftJoin('movement.item', 'item');

    this.applyDateRange(baseQuery, query);

    const summaryQuery = baseQuery
      .clone()
      .select('COUNT(movement.id)', 'totalMovements')
      .addSelect(
        `COALESCE(SUM(CASE WHEN movement.movementType = :inType THEN movement.quantity ELSE 0 END), 0)`,
        'totalInQuantity',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN movement.movementType = :outType THEN movement.quantity ELSE 0 END), 0)`,
        'totalOutQuantity',
      )
      .addSelect('COUNT(DISTINCT item.id)', 'uniqueItems')
      .setParameters({
        inType: InventoryMovementType.IN,
        outType: InventoryMovementType.OUT,
      });

    const rawSummary = (await summaryQuery.getRawOne()) as RawMetricsSummary;

    const topItemsQuery = baseQuery
      .clone()
      .select('item.id', 'itemId')
      .addSelect('item.name', 'name')
      .addSelect('COUNT(movement.id)', 'movementsCount')
      .addSelect(
        `COALESCE(SUM(CASE WHEN movement.movementType = :inType THEN movement.quantity ELSE 0 END), 0)`,
        'inQuantity',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN movement.movementType = :outType THEN movement.quantity ELSE 0 END), 0)`,
        'outQuantity',
      )
      .groupBy('item.id')
      .addGroupBy('item.name')
      .orderBy('outQuantity', 'DESC')
      .addOrderBy('movementsCount', 'DESC')
      .setParameters({
        inType: InventoryMovementType.IN,
        outType: InventoryMovementType.OUT,
      })
      .limit(query.limit ?? 5);

    const rawTopItems = (await topItemsQuery.getRawMany()) as RawTopItemMetric[];

    return {
      range: { from: query.from, to: query.to },
      summary: {
        totalMovements: Number(rawSummary?.totalMovements ?? 0),
        totalInQuantity: Number(rawSummary?.totalInQuantity ?? 0),
        totalOutQuantity: Number(rawSummary?.totalOutQuantity ?? 0),
        uniqueItems: Number(rawSummary?.uniqueItems ?? 0),
      },
      topItems: rawTopItems.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        movementsCount: Number(item.movementsCount ?? 0),
        inQuantity: Number(item.inQuantity ?? 0),
        outQuantity: Number(item.outQuantity ?? 0),
      })),
    };
  }

  private getSafeFunctionReference(functionName: string): string {
    const parts = functionName.trim().split('.');

    if (parts.length === 0 || parts.length > 2) {
      throw new BadRequestException('Invalid inventory out function name');
    }

    for (const part of parts) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part)) {
        throw new BadRequestException('Invalid inventory out function name');
      }
    }

    return parts.length === 1 ? `public.${parts[0]}` : `${parts[0]}.${parts[1]}`;
  }

  private async functionExists(functionReference: string): Promise<boolean> {
    const [schema, name] = functionReference.split('.');
    const result = await this.dataSource.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = $1
            AND p.proname = $2
            AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'uuid, numeric, uuid'
        ) AS exists
      `,
      [schema, name],
    );

    return Boolean(result?.[0]?.exists);
  }

  private applyDateRange(
    qb: SelectQueryBuilder<InventoryMovement>,
    query: DateRangeQueryDto,
  ): void {
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
  }
}
