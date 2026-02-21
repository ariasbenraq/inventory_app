import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryOutFunction1710000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.inventory_out(
        p_item_id uuid,
        p_quantity numeric,
        p_user_id uuid
      )
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_current_stock numeric;
      BEGIN
        IF p_quantity <= 0 THEN
          RAISE EXCEPTION 'Quantity must be greater than zero';
        END IF;

        SELECT COALESCE(SUM(
          CASE
            WHEN movement_type = 'IN' THEN quantity
            WHEN movement_type = 'OUT' THEN -quantity
            ELSE 0
          END
        ), 0)
        INTO v_current_stock
        FROM inventory_movements
        WHERE "itemId" = p_item_id;

        IF v_current_stock < p_quantity THEN
          RAISE EXCEPTION 'Insufficient stock for item %', p_item_id;
        END IF;

        INSERT INTO inventory_movements (id, "itemId", movement_type, quantity, created_at)
        VALUES (uuid_generate_v4(), p_item_id, 'OUT', p_quantity, now());
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS public.inventory_out(uuid, numeric, uuid)',
    );
  }
}
