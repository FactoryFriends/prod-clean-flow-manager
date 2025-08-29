-- Add variable_packaging field to products table
ALTER TABLE public.products 
ADD COLUMN variable_packaging boolean NOT NULL DEFAULT false;

-- Add items_per_package field to production_batches table
ALTER TABLE public.production_batches 
ADD COLUMN items_per_package integer NULL;