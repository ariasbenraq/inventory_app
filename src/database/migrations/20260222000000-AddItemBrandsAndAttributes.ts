import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddItemBrandsAndAttributes20260222000000
  implements MigrationInterface
{
  name = 'AddItemBrandsAndAttributes20260222000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBrandsTable = await queryRunner.hasTable('brands');
    if (!hasBrandsTable) {
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
            {
              name: 'name',
              type: 'varchar',
              isNullable: false,
              isUnique: true,
            },
          ],
        }),
      );
    }

    const itemsTable = await queryRunner.getTable('items');
    if (!itemsTable) {
      throw new Error('items table not found');
    }

    const hasBrandIdColumn = itemsTable.columns.some((c) => c.name === 'brand_id');
    if (!hasBrandIdColumn) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'brand_id',
          type: 'bigint',
          isNullable: true,
        }),
      );
    }

    const hasAttributesColumn = itemsTable.columns.some(
      (c) => c.name === 'attributes',
    );
    if (!hasAttributesColumn) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'attributes',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    const refreshedItemsTable = await queryRunner.getTable('items');
    const hasBrandForeignKey = refreshedItemsTable?.foreignKeys.some(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'brand_id',
    );

    if (!hasBrandForeignKey) {
      await queryRunner.createForeignKey(
        'items',
        new TableForeignKey({
          name: 'fk_items_brand_id',
          columnNames: ['brand_id'],
          referencedTableName: 'brands',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const itemsTable = await queryRunner.getTable('items');

    const brandForeignKey = itemsTable?.foreignKeys.find(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'brand_id',
    );

    if (brandForeignKey) {
      await queryRunner.dropForeignKey('items', brandForeignKey);
    }

    const refreshedItemsTable = await queryRunner.getTable('items');

    const hasAttributesColumn = refreshedItemsTable?.columns.some(
      (c) => c.name === 'attributes',
    );
    if (hasAttributesColumn) {
      await queryRunner.dropColumn('items', 'attributes');
    }

    const hasBrandIdColumn = refreshedItemsTable?.columns.some(
      (c) => c.name === 'brand_id',
    );
    if (hasBrandIdColumn) {
      await queryRunner.dropColumn('items', 'brand_id');
    }

    const hasBrandsTable = await queryRunner.hasTable('brands');
    if (hasBrandsTable) {
      await queryRunner.dropTable('brands');
    }
  }
}
