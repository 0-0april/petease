-- Migration: Align MEDICALHISTORY table to new schema
-- Run this once against your Supabase project (SQL editor or CLI).

-- 1. Ensure the table exists with the correct shape.
--    If it already exists from petease.sql, the ALTER statements below
--    bring it into the final state without touching existing rows.

-- Drop old columns that no longer belong (old schema used Medicine / Description / ServID).
ALTER TABLE public.MEDICALHISTORY
  DROP COLUMN IF EXISTS "Medicine",
  DROP COLUMN IF EXISTS "Description",
  DROP COLUMN IF EXISTS "ServID";

-- 2. Add the new columns if they are missing.

ALTER TABLE public.MEDICALHISTORY
  ADD COLUMN IF NOT EXISTS "Medication"   text          NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "MedDescript"  text,
  ADD COLUMN IF NOT EXISTS "MedVerified"  boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "UserPetID"    uuid,
  ADD COLUMN IF NOT EXISTS "LogID"        uuid;

-- 3. Remove the DEFAULT '' placeholder on Medication now that the column exists
--    (new rows must supply a value explicitly; the DEFAULT was only for the migration).
ALTER TABLE public.MEDICALHISTORY
  ALTER COLUMN "Medication" DROP DEFAULT;

-- 4. Add FK constraints (idempotent — skip if they already exist).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MEDICALHISTORY_UserPetID_fkey'
  ) THEN
    ALTER TABLE public.MEDICALHISTORY
      ADD CONSTRAINT "MEDICALHISTORY_UserPetID_fkey"
      FOREIGN KEY ("UserPetID") REFERENCES public.USERPETS("UserPetID");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MEDICALHISTORY_LogID_fkey'
  ) THEN
    ALTER TABLE public.MEDICALHISTORY
      ADD CONSTRAINT "MEDICALHISTORY_LogID_fkey"
      FOREIGN KEY ("LogID") REFERENCES public.APPOINTMENTLOGS("LogID");
  END IF;
END $$;

-- 5. Helpful indexes.
CREATE INDEX IF NOT EXISTS idx_medicalhistory_userpetid  ON public.MEDICALHISTORY ("UserPetID");
CREATE INDEX IF NOT EXISTS idx_medicalhistory_logid       ON public.MEDICALHISTORY ("LogID");
CREATE INDEX IF NOT EXISTS idx_medicalhistory_verified    ON public.MEDICALHISTORY ("MedVerified");
