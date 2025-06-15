
-- Add an allergens column to the products table. This will store an array of text values.
ALTER TABLE public.products
ADD COLUMN allergens TEXT[] DEFAULT ARRAY[]::TEXT[];

-- (Optional) Add a comment for clarity
COMMENT ON COLUMN public.products.allergens IS 'Array of English allergen names (strings) applicable for the product';
