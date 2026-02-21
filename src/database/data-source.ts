import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Item } from '../items/item.entity';
import { Unit } from '../units/unit.entity';
import { Ministry } from '../ministries/ministry.entity';
import { Request } from '../requests/request.entity';
import { RequestItem } from '../requests/request-item.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { ItemStockView } from '../inventory/item-stock.view';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Role,
    Item,
    Unit,
    Ministry,
    Request,
    RequestItem,
    InventoryMovement,
    ItemStockView,
  ],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'schema_migrations',
  synchronize: false,
});

export default dataSource;
