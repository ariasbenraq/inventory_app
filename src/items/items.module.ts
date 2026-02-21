import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Unit } from '../units/unit.entity';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Brand } from './brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Unit, Brand])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
