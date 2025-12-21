-- SQL script to add dealer_id column to purchases table
-- Run this in your Supabase SQL editor if the column doesn't exist

-- Step 1: Add dealer_id column to purchases table (nullable)
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS dealer_id bigint;

-- Step 2: Add foreign key constraint with a named relationship
-- This allows Supabase to properly join the tables
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'purchases_dealer_id_fkey'
        AND table_name = 'purchases'
    ) THEN
        ALTER TABLE public.purchases 
        ADD CONSTRAINT purchases_dealer_id_fkey 
        FOREIGN KEY (dealer_id) 
        REFERENCES public.sub_dealers(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_dealer_id ON public.purchases(dealer_id);

-- Step 4: Optional: Add comment to the column
COMMENT ON COLUMN public.purchases.dealer_id IS 'Foreign key reference to sub_dealers table';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'purchases' 
  AND column_name = 'dealer_id';

