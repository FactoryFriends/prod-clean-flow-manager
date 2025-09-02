-- Fix dispatch_items check constraint to allow 'ingredient' type
-- This resolves the "Failed to create dispatch" error

-- Drop the existing constraint
ALTER TABLE public.dispatch_items DROP CONSTRAINT IF EXISTS dispatch_items_item_type_check;

-- Add the updated constraint with 'ingredient' included
ALTER TABLE public.dispatch_items 
ADD CONSTRAINT dispatch_items_item_type_check 
CHECK (item_type = ANY (ARRAY['batch'::text, 'external'::text, 'ingredient'::text]));

-- Add index for better performance on item_type queries
CREATE INDEX IF NOT EXISTS idx_dispatch_items_item_type ON public.dispatch_items(item_type);