-- Drop the existing check constraint and create a new one that includes supplier_package
ALTER TABLE public.unit_options 
DROP CONSTRAINT unit_options_unit_type_check;

ALTER TABLE public.unit_options 
ADD CONSTRAINT unit_options_unit_type_check 
CHECK (unit_type = ANY (ARRAY['purchase'::text, 'inner'::text, 'supplier_package'::text]));

-- Now add supplier_package unit type and seed with common values
INSERT INTO public.unit_options (name, unit_type, active) VALUES
  ('BOX', 'supplier_package', true),
  ('CASE', 'supplier_package', true),
  ('BAG', 'supplier_package', true),
  ('PACK', 'supplier_package', true),
  ('CARTON', 'supplier_package', true),
  ('TRAY', 'supplier_package', true),
  ('CONTAINER', 'supplier_package', true),
  ('PALLET', 'supplier_package', true),
  ('BOTTLE', 'supplier_package', true),
  ('CAN', 'supplier_package', true),
  ('JAR', 'supplier_package', true),
  ('TUBE', 'supplier_package', true),
  ('ROLL', 'supplier_package', true);