-- Add dealer_id column to existing purchases table
-- Run this if you already have the purchases table created

-- Add dealer_id column to purchases table
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS dealer_id bigint REFERENCES public.sub_dealers(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_dealer_id ON public.purchases(dealer_id);

