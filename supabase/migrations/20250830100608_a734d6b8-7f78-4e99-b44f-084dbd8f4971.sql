-- Insert missing external products, checking if they already exist
INSERT INTO public.products (
  name, 
  product_type, 
  product_kind, 
  supplier_name, 
  unit_type, 
  unit_size, 
  active,
  pickable
) 
SELECT 'Basmati Rice', 'extern', 'extern', 'Rice Masters', 'kg', 1.0, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Basmati Rice')
UNION ALL
SELECT 'Coconut Milk', 'extern', 'extern', 'Thai Suppliers Ltd', 'liter', 1.0, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Coconut Milk')
UNION ALL
SELECT 'Green Curry Paste', 'extern', 'extern', 'Spice World', 'jar', 1.0, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Green Curry Paste');