import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelaxItemNameUniqueness20260222010000 implements MigrationInterface {
  name = 'RelaxItemNameUniqueness20260222010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'items_name_key'
            AND conrelid = 'public.items'::regclass
        ) THEN
          ALTER TABLE public.items DROP CONSTRAINT items_name_key;
        END IF;
      END $$;
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_items_name ON public.items(name)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS public.idx_items_name');

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'items_name_key'
            AND conrelid = 'public.items'::regclass
        ) THEN
          ALTER TABLE public.items
            ADD CONSTRAINT items_name_key UNIQUE (name);
        END IF;
      END $$;
    `);
  }
}
