import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Unit } from '../units/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Brand } from './brand.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async createItem(dto: CreateItemDto): Promise<Item> {
    const unit = await this.unitsRepository.findOne({ where: { id: dto.unitId } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    if (dto.brandId) {
      const brand = await this.brandsRepository.findOne({ where: { id: dto.brandId } });
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    const item = this.itemsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      unitId: dto.unitId,
      brandId: dto.brandId ?? null,
      attributes: dto.attributes ?? null,
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

    if (dto.brandId !== undefined) {
      if (dto.brandId === null) {
        item.brandId = null;
      } else {
        const brand = await this.brandsRepository.findOne({ where: { id: dto.brandId } });
        if (!brand) {
          throw new NotFoundException('Brand not found');
        }
        item.brandId = dto.brandId;
      }
    }

    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    if (dto.description !== undefined) {
      item.description = dto.description;
    }

    if (dto.attributes !== undefined) {
      item.attributes = dto.attributes;
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
    return this.itemsRepository.find({ relations: ['brand'] });
  }
}
