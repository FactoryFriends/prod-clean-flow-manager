-- Insert missing external products from the hardcoded data
INSERT INTO public.products (
  name, 
  product_type, 
  product_kind, 
  supplier_name, 
  unit_type, 
  unit_size, 
  active,
  pickable
) VALUES 
(
  'Basmati Rice', 
  'extern', 
  'extern', 
  'Rice Masters', 
  'kg', 
  1.0, 
  true,
  false
),
(
  'Coconut Milk', 
  'extern', 
  'extern', 
  'Thai Suppliers Ltd', 
  'liter', 
  1.0, 
  true,
  false
),
(
  'Green Curry Paste', 
  'extern', 
  'extern', 
  'Spice World', 
  'jar', 
  1.0, 
  true,
  false
)
ON CONFLICT (name) DO NOTHING;