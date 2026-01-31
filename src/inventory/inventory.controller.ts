import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { InventoryMovement } from './inventory-movement.entity';
import { InventoryInDto } from './dto/inventory-in.dto';
import { InventoryOutDto } from './dto/inventory-out.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AuthenticatedRequest } from '../common/types';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('in')
  @Roles('USER')
  async registerIn(@Body() body: InventoryInDto): Promise<InventoryMovement> {
    return this.inventoryService.registerInventoryIn(body);
  }

  @Post('out')
  @Roles('USER')
  async registerOut(
    @Req() request: AuthenticatedRequest,
    @Body() body: InventoryOutDto,
  ): Promise<void> {
    await this.inventoryService.registerInventoryOut(
      request.user?.userId ?? '',
      body,
    );
  }

  @Get('movements')
  @Roles('USER', 'REQ_ADMIN')
  async getMovements(
    @Query() query: DateRangeQueryDto,
  ): Promise<InventoryMovement[]> {
    return this.inventoryService.getMovements(query);
  }

  @Get('metrics')
  @Roles('REQ_ADMIN')
  async getMetrics(
    @Query() query: DashboardMetricsQueryDto,
  ): Promise<{
    range: { from?: string; to?: string };
    summary: {
      totalMovements: number;
      totalInQuantity: number;
      totalOutQuantity: number;
      uniqueItems: number;
    };
    topItems: Array<{
      itemId: string;
      name: string;
      movementsCount: number;
      inQuantity: number;
      outQuantity: number;
    }>;
  }> {
    return this.inventoryService.getDashboardMetrics(query);
  }
}
