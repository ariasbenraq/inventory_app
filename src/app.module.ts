import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ItemsModule } from './items/items.module';
import { UnitsModule } from './units/units.module';
import { RequestsModule } from './requests/requests.module';
import { InventoryModule } from './inventory/inventory.module';
import { MinistriesModule } from './ministries/ministries.module';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Item } from './items/item.entity';
import { Unit } from './units/unit.entity';
import { Ministry } from './ministries/ministry.entity';
import { Request } from './requests/request.entity';
import { RequestItem } from './requests/request-item.entity';
import { InventoryMovement } from './inventory/inventory-movement.entity';
import { ItemStockView } from './inventory/item-stock.view';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 10,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
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
        migrations: [`${__dirname}/database/migrations/*{.ts,.js}`],
        migrationsTableName: 'schema_migrations',
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ItemsModule,
    UnitsModule,
    RequestsModule,
    InventoryModule,
    MinistriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
