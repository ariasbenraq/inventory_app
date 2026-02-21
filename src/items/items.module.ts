import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Unit } from '../units/unit.entity';
import { ItemsService } from './items.service';
import { BrandsService } from './brands.service';
import { Brand } from './brand.entity';
import { ItemsController } from './items.controller';
import { BrandsController } from './brands.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Unit, Brand])],
  controllers: [ItemsController, BrandsController],
  providers: [ItemsService, BrandsService],
})
export class ItemsModule {}
