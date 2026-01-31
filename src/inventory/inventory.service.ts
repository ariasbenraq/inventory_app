import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from './inventory-movement.entity';
import { ItemStockView } from './item-stock.view';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementsRepository: Repository<InventoryMovement>,
    @InjectRepository(ItemStockView)
    private readonly stockRepository: Repository<ItemStockView>,
  ) {}

  async getStock(): Promise<ItemStockView[]> {
    return this.stockRepository.find();
  }

  async getMovements(): Promise<InventoryMovement[]> {
    return this.movementsRepository.find({
      relations: ['item'],
      order: { createdAt: 'DESC' },
    });
  }
}
