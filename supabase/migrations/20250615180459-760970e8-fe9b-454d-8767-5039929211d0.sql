
-- Add 'dish' as a logical/allowed value for product_type and product_kind (no type restriction in table, but for data clarity)
-- Optionally update existing comments/usage for future reference

-- Update product_type for future reference; you may want to backfill later
-- Nothing to alter in schema as fields are TEXT, but can comment for future devs/documenters:
COMMENT ON COLUMN public.products.product_type IS 'Type of product: one of ''ingredient'', ''semi-finished'', or ''dish'' (formerly ''zelfgemaakt'' or ''extern'')';
COMMENT ON COLUMN public.products.product_kind IS 'Kind of product: one of ''ingredient'', ''semi-finished'', or ''dish''';

-- (Optional) If any pre-existing products should be marked as dish you can do:
-- UPDATE public.products SET product_type = 'dish', product_kind = 'dish' WHERE [add-your-condition-here];

-- No new columns or table changes required.
