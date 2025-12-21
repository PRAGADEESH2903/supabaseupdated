-- Add dealer_id column to purchases table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the dealer_id column
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS dealer_id bigint;

-- Step 2: Add foreign key constraint to sub_dealers table
ALTER TABLE public.purchases 
ADD CONSTRAINT purchases_dealer_id_fkey 
FOREIGN KEY (dealer_id) 
REFERENCES public.sub_dealers(id) 
ON DELETE SET NULL;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_dealer_id ON public.purchases(dealer_id);

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'purchases' 
  AND column_name = 'dealer_id';

