import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ItemStockView } from './item-stock.view';
import { InventoryMovement } from './inventory-movement.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async getStock(): Promise<ItemStockView[]> {
    return this.inventoryService.getStock();
  }

  @Get('movements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async getMovements(): Promise<InventoryMovement[]> {
    return this.inventoryService.getMovements();
  }
}
