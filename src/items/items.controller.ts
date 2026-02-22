import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './item.entity';
import { ItemType } from './item-type.enum';

@Controller('items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles('USER')
  async createItem(@Body() body: CreateItemDto): Promise<Item> {
    return this.itemsService.createItem(body);
  }

  @Patch(':id')
  @Roles('USER')
  async updateItem(
    @Param('id') id: string,
    @Body() body: UpdateItemDto,
  ): Promise<Item> {
    return this.itemsService.updateItem(id, body);
  }

  @Patch(':id/disable')
  @Roles('USER')
  async disableItem(@Param('id') id: string): Promise<Item> {
    return this.itemsService.disableItem(id);
  }

  @Get('attribute-dictionary')
  @Roles('USER')
  getAttributeDictionary(): Record<ItemType, readonly string[]> {
    return this.itemsService.getAttributeDictionary();
  }

  @Get()
  @Roles('USER')
  async getItems(): Promise<Item[]> {
    return this.itemsService.getItems();
  }
}
