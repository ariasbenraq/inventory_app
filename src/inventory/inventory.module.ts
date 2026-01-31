import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMovement } from './inventory-movement.entity';
import { Item } from '../items/item.entity';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, Item]), UnitsModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
