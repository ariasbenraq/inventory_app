import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Item } from '../items/item.entity';
import { Brand } from '../items/brand.entity';
import { Unit } from '../units/unit.entity';
import { Ministry } from '../ministries/ministry.entity';
import { Request } from '../requests/request.entity';
import { RequestItem } from '../requests/request-item.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { ItemStockView } from '../inventory/item-stock.view';

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? '5433';

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  throw new Error(
    'DATABASE_URL is not set. Configure DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME (DB_PORT defaults to 5433).',
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: resolveDatabaseUrl(),
  entities: [
    User,
    Role,
    Item,
    Brand,
    Unit,
    Ministry,
    Request,
    RequestItem,
    InventoryMovement,
    ItemStockView,
  ],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'schema_migrations',
  synchronize: false,
});
