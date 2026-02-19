import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'v_item_stock' })
export class ItemStockView {
  @ViewColumn({ name: 'item_id' })
  itemId!: string;

  @ViewColumn({ name: 'item_name' })
  itemName!: string;

  @ViewColumn({ name: 'stock' })
  stock!: number;
}
