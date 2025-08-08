-- Update the check constraint to allow supplier_name for both extern and ingredient products
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS supplier_name_required_for_extern;

-- Create new constraint that allows supplier_name for both extern and ingredient products
ALTER TABLE public.products ADD CONSTRAINT supplier_name_required_for_extern_and_ingredient 
CHECK (
  (product_type = 'extern' AND supplier_name IS NOT NULL AND supplier_name != '') OR
  (product_kind = 'extern' AND supplier_name IS NOT NULL AND supplier_name != '') OR
  (product_type = 'ingredient' AND supplier_name IS NOT NULL AND supplier_name != '') OR
  (product_kind = 'ingredient' AND supplier_name IS NOT NULL AND supplier_name != '') OR
  (product_type NOT IN ('extern', 'ingredient') AND product_kind NOT IN ('extern', 'ingredient'))
);