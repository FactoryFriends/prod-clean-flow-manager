
-- Add purchase package structure to products table for external products/drinks
ALTER TABLE public.products ADD COLUMN supplier_package_unit TEXT; -- e.g. CASE, BOX, CRATE
ALTER TABLE public.products ADD COLUMN units_per_package INTEGER; -- e.g. 24 (bottles in a case)
ALTER TABLE public.products ADD COLUMN inner_unit_type TEXT; -- e.g. BOTTLE, LITER, CAN
ALTER TABLE public.products ADD COLUMN price_per_package NUMERIC; -- e.g. price per CASE

-- No need for NOT NULL, since some products are not packaged this way
