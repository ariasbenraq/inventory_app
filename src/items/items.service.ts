import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Unit } from '../units/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async createItem(dto: CreateItemDto): Promise<Item> {
    const unit = await this.unitsRepository.findOne({ where: { id: dto.unitId } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    const item = this.itemsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      unitId: dto.unitId,
      isActive: true,
    });

    return this.itemsRepository.save(item);
  }

  async updateItem(id: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (dto.unitId) {
      const unit = await this.unitsRepository.findOne({ where: { id: dto.unitId } });
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      item.unitId = dto.unitId;
    }

    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    if (dto.description !== undefined) {
      item.description = dto.description;
    }

    return this.itemsRepository.save(item);
  }

  async disableItem(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (!item.isActive) {
      throw new BadRequestException('Item already disabled');
    }

    item.isActive = false;
    return this.itemsRepository.save(item);
  }

  async getItems(): Promise<Item[]> {
    return this.itemsRepository.find();
  }
}
