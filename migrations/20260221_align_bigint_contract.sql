-- Align application contract to bigint-based schema.
-- Safe/idempotent migration for environments already on bigint.
-- Run inside a transaction when possible.

BEGIN;

-- 1) Ensure required enums exist (no-op if already present).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'movement_type'
  ) THEN
    CREATE TYPE public.movement_type AS ENUM ('IN', 'OUT');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'request_status'
  ) THEN
    CREATE TYPE public.request_status AS ENUM (
      'PENDING',
      'APPROVED',
      'FULFILLED',
      'CANCELLED',
      'CONFIRMED'
    );
  END IF;
END $$;

-- 2) Align movement/request status columns to enum contract.
DO $$
DECLARE
  movement_udt text;
  request_udt text;
BEGIN
  SELECT c.udt_name INTO movement_udt
  FROM information_schema.columns c
  WHERE c.table_schema='public'
    AND c.table_name='inventory_movements'
    AND c.column_name='movement_type';

  IF movement_udt IS DISTINCT FROM 'movement_type' THEN
    ALTER TABLE public.inventory_movements
      ALTER COLUMN movement_type TYPE public.movement_type
      USING movement_type::text::public.movement_type;
  END IF;

  SELECT c.udt_name INTO request_udt
  FROM information_schema.columns c
  WHERE c.table_schema='public'
    AND c.table_name='requests'
    AND c.column_name='status';

  IF request_udt IS DISTINCT FROM 'request_status' THEN
    ALTER TABLE public.requests
      ALTER COLUMN status TYPE public.request_status
      USING status::text::public.request_status;
  END IF;
END $$;

-- 3) Keep only bigint signature for inventory_out to match backend call.
-- Backend now calls: inventory_out(bigint, numeric, bigint).
DROP FUNCTION IF EXISTS public.inventory_out(bigint, numeric, uuid);

-- Optional safety check: ensure bigint overload exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'inventory_out'
      AND pg_get_function_identity_arguments(p.oid) = 'p_item_id bigint, p_quantity numeric, p_user_id bigint'
  ) THEN
    RAISE EXCEPTION 'Missing required function signature: public.inventory_out(bigint, numeric, bigint)';
  END IF;
END $$;

-- 4) Validate view shape expected by backend mapping.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='v_item_stock'
      AND column_name='item_name'
  ) OR NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='v_item_stock'
      AND column_name='stock'
  ) THEN
    RAISE EXCEPTION 'View public.v_item_stock must expose columns item_name and stock';
  END IF;
END $$;

COMMIT;
