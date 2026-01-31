import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request } from './request.entity';
import { RequestItem } from './request-item.entity';
import { Ministry } from '../ministries/ministry.entity';
import { Item } from '../items/item.entity';
import { Unit } from '../units/unit.entity';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, RequestItem, Ministry, Item, Unit]),
    UnitsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
