import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    const existingBrand = await this.brandsRepository.findOne({
      where: { name: dto.name.trim() },
    });

    if (existingBrand) {
      throw new BadRequestException('Brand already exists');
    }

    const brand = this.brandsRepository.create({
      name: dto.name.trim(),
      isActive: true,
    });

    return this.brandsRepository.save(brand);
  }

  async updateBrand(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      const duplicate = await this.brandsRepository.findOne({ where: { name: trimmedName } });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException('Brand already exists');
      }
      brand.name = trimmedName;
    }

    if (dto.isActive !== undefined) {
      brand.isActive = dto.isActive;
    }

    return this.brandsRepository.save(brand);
  }

  async getBrands(activeOnly = false): Promise<Brand[]> {
    if (activeOnly) {
      return this.brandsRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
    }

    return this.brandsRepository.find({ order: { name: 'ASC' } });
  }
}
