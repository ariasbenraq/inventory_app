import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Brand } from './brand.entity';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles('USER')
  async createBrand(@Body() body: CreateBrandDto): Promise<Brand> {
    return this.brandsService.createBrand(body);
  }

  @Patch(':id')
  @Roles('USER')
  async updateBrand(@Param('id') id: string, @Body() body: UpdateBrandDto): Promise<Brand> {
    return this.brandsService.updateBrand(id, body);
  }

  @Get()
  @Roles('USER')
  async getBrands(@Query('activeOnly') activeOnly?: string): Promise<Brand[]> {
    return this.brandsService.getBrands(activeOnly === 'true');
  }
}
