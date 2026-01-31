import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'v_item_stock' })
export class ItemStockView {
  @ViewColumn({ name: 'item_id' })
  itemId!: string;

  @ViewColumn({ name: 'quantity' })
  quantity!: number;
}
