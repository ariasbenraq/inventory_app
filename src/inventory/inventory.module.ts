import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMovement } from './inventory-movement.entity';
import { ItemStockView } from './item-stock.view';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, ItemStockView])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
