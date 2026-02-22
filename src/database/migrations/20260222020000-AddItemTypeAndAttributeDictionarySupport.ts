import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemTypeAndAttributeDictionarySupport20260222020000
  implements MigrationInterface
{
  name = 'AddItemTypeAndAttributeDictionarySupport20260222020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typname = 'item_type'
        ) THEN
          CREATE TYPE public.item_type AS ENUM (
            'GENERAL',
            'CONSUMABLE',
            'DURABLE',
            'ELECTRICAL',
            'OFFICE_SUPPLY'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE public.items
      ADD COLUMN IF NOT EXISTS item_type public.item_type NOT NULL DEFAULT 'GENERAL';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.items
      DROP COLUMN IF EXISTS item_type;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typname = 'item_type'
        ) THEN
          DROP TYPE public.item_type;
        END IF;
      END $$;
    `);
  }
}
