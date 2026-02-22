import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Unit } from '../units/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Brand } from './brand.entity';
import { ItemType } from './item-type.enum';
import { ITEM_ATTRIBUTE_DICTIONARY } from './item-attributes.dictionary';

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

    const brandId = await this.resolveBrandId(dto.brandId, dto.brandName);
    const itemType = dto.itemType ?? ItemType.GENERAL;
    this.validateAttributes(itemType, dto.attributes);

    const item = this.itemsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      unitId: dto.unitId,
      brandId,
      itemType,
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

    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    if (dto.description !== undefined) {
      item.description = dto.description;
    }

    if (dto.brandId !== undefined || dto.brandName !== undefined) {
      item.brandId = await this.resolveBrandId(dto.brandId, dto.brandName);
    }

    if (dto.itemType !== undefined) {
      item.itemType = dto.itemType;
    }

    const nextAttributes = dto.attributes !== undefined ? dto.attributes : item.attributes;
    this.validateAttributes(item.itemType, nextAttributes ?? undefined);

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
    return this.itemsRepository.find({ relations: { brand: true } });
  }

  getAttributeDictionary(): Record<ItemType, readonly string[]> {
    return ITEM_ATTRIBUTE_DICTIONARY;
  }

  private validateAttributes(
    itemType: ItemType,
    attributes?: Record<string, string>,
  ): void {
    if (!attributes) {
      return;
    }

    const allowedKeys = new Set(ITEM_ATTRIBUTE_DICTIONARY[itemType]);
    const invalidKeys = Object.keys(attributes).filter((key) => !allowedKeys.has(key));

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid attributes for itemType ${itemType}: ${invalidKeys.join(', ')}`,
      );
    }
  }

  private async resolveBrandId(
    brandId?: string,
    brandName?: string,
  ): Promise<string | null> {
    if (brandId && brandName) {
      throw new BadRequestException('Use brandId or brandName, but not both');
    }

    if (brandId) {
      const brand = await this.brandsRepository.findOne({ where: { id: brandId } });
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      return brand.id;
    }

    if (brandName) {
      const normalizedName = brandName.trim();
      let brand = await this.brandsRepository.findOne({
        where: { name: normalizedName },
      });

      if (!brand) {
        brand = this.brandsRepository.create({ name: normalizedName });
        brand = await this.brandsRepository.save(brand);
      }

      return brand.id;
    }

    return null;
  }
}
