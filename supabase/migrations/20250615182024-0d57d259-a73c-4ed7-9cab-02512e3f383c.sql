
-- 1. Add fields to the products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cost NUMERIC,
ADD COLUMN IF NOT EXISTS markup_percent NUMERIC,
ADD COLUMN IF NOT EXISTS sales_price NUMERIC,
ADD COLUMN IF NOT EXISTS minimal_margin_threshold_percent NUMERIC DEFAULT 25;

-- 2. Product cost history tracking table
CREATE TABLE IF NOT EXISTS public.product_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  old_cost NUMERIC,
  new_cost NUMERIC NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT
);

-- (Future) Optional: Table for global default margin threshold per product type (not implemented yet)
-- CREATE TABLE IF NOT EXISTS public.product_type_margin_defaults (
--   product_type TEXT PRIMARY KEY,
--   minimal_margin_threshold_percent NUMERIC DEFAULT 25
-- );
