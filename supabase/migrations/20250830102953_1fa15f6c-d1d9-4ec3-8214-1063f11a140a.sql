-- Add supplier_package unit type and seed with common values
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