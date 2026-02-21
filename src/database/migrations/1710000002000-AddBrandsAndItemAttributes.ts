import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddBrandsAndItemAttributes1710000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'brands',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'brand_id',
        type: 'bigint',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'attributes',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'items',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_items_brand_id ON items (brand_id)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_items_brand_id');

    const itemsTable = await queryRunner.getTable('items');
    const brandFk = itemsTable?.foreignKeys.find((fk) => fk.columnNames.includes('brand_id'));
    if (brandFk) {
      await queryRunner.dropForeignKey('items', brandFk);
    }

    await queryRunner.dropColumn('items', 'attributes');
    await queryRunner.dropColumn('items', 'brand_id');
    await queryRunner.dropTable('brands');
  }
}
