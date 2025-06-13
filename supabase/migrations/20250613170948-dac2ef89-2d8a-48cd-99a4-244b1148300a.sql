
-- Add shelf life and price columns to products table
ALTER TABLE public.products 
ADD COLUMN shelf_life_days INTEGER,
ADD COLUMN price_per_unit DECIMAL(10,2);

-- Add some comments to clarify the new columns
COMMENT ON COLUMN public.products.shelf_life_days IS 'Default shelf life in days for this product';
COMMENT ON COLUMN public.products.price_per_unit IS 'Price per packaged unit in the local currency';

-- Update existing products with some default values (you can adjust these)
UPDATE public.products SET 
  shelf_life_days = 7,  -- Default 7 days shelf life
  price_per_unit = 0.00 -- Default price, to be set by manager
WHERE shelf_life_days IS NULL OR price_per_unit IS NULL;
