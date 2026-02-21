import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const baselineTables = [
      'roles',
      'users',
      'user_roles',
      'units',
      'items',
      'ministries',
      'requests',
      'request_items',
      'inventory_movements',
    ];

    const existingCount = (
      await Promise.all(baselineTables.map((table) => queryRunner.hasTable(table)))
    ).filter(Boolean).length;

    // Some environments were provisioned manually before migrations were formalized.
    // If the full baseline already exists, skip safely so this migration can be recorded.
    if (existingCount === baselineTables.length) {
      return;
    }

    if (existingCount > 0) {
      throw new Error(
        'InitialSchema1710000000000 detected a partially initialized database. Please complete bootstrap manually or baseline migrations before rerunning.',
      );
    }

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'code', type: 'varchar', isUnique: true },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'username', type: 'varchar', isUnique: true },
          { name: 'password_hash', type: 'varchar' },
          { name: 'full_name', type: 'varchar' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_test_user', type: 'boolean', default: false },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'user_id', type: 'uuid', isPrimary: true },
          { name: 'role_id', type: 'uuid', isPrimary: true },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'units',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'code', type: 'varchar' },
          { name: 'factor', type: 'numeric' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'unit_id', type: 'uuid' },
          { name: 'is_active', type: 'boolean', default: true },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'ministries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'createdById', type: 'uuid' },
          { name: 'ministryId', type: 'uuid' },
          { name: 'status', type: 'varchar', default: "'PENDING'" },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'request_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'requestId', type: 'uuid' },
          { name: 'itemId', type: 'uuid' },
          { name: 'unitId', type: 'uuid' },
          { name: 'quantity', type: 'numeric' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'inventory_movements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'itemId', type: 'uuid' },
          { name: 'movement_type', type: 'varchar' },
          { name: 'quantity', type: 'numeric' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKeys('user_roles', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKey(
      'items',
      new TableForeignKey({
        columnNames: ['unit_id'],
        referencedTableName: 'units',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKeys('requests', [
      new TableForeignKey({
        columnNames: ['createdById'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['ministryId'],
        referencedTableName: 'ministries',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);

    await queryRunner.createForeignKeys('request_items', [
      new TableForeignKey({
        columnNames: ['requestId'],
        referencedTableName: 'requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['itemId'],
        referencedTableName: 'items',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['unitId'],
        referencedTableName: 'units',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);

    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        columnNames: ['itemId'],
        referencedTableName: 'items',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.query(`
      CREATE VIEW v_item_stock AS
      SELECT
        "itemId" AS item_id,
        COALESCE(
          SUM(
            CASE
              WHEN movement_type = 'IN' THEN quantity
              WHEN movement_type = 'OUT' THEN -quantity
              ELSE 0
            END
          ),
          0
        ) AS quantity
      FROM inventory_movements
      GROUP BY "itemId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS v_item_stock');
    await queryRunner.dropTable('inventory_movements');
    await queryRunner.dropTable('request_items');
    await queryRunner.dropTable('requests');
    await queryRunner.dropTable('ministries');
    await queryRunner.dropTable('items');
    await queryRunner.dropTable('units');
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('roles');
  }
}
