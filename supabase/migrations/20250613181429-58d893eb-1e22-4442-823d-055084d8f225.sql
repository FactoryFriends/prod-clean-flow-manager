
-- Insert dummy staff codes for testing
INSERT INTO public.staff_codes (code, name, initials, role, location, active) VALUES
('1234', 'John Smith', 'JS', 'chef', 'tothai'::location_type, true),
('5678', 'Maria Garcia', 'MG', 'cleaner', 'khin'::location_type, true),
('9999', 'Admin User', 'AU', 'manager', 'both'::location_type, true),
('1111', 'Alice Johnson', 'AJ', 'chef', 'tothai'::location_type, true),
('2222', 'Bob Wilson', 'BW', 'cleaner', 'khin'::location_type, true)
ON CONFLICT (code) DO NOTHING;

-- Insert dummy customers including KHIN
INSERT INTO public.customers (name, customer_type, contact_person, email, phone, active) VALUES
('KHIN Restaurant', 'restaurant', 'Manager KHIN', 'manager@khin.com', '+32 2 123 4567', true),
('Restaurant De Kroon', 'restaurant', 'Chef De Kroon', 'chef@dekroon.be', '+32 2 234 5678', true),
('Bistro Central', 'external', 'Owner Central', 'info@bistrocentral.be', '+32 2 345 6789', true),
('Café Mozart', 'restaurant', 'Manager Mozart', 'contact@mozart.be', '+32 2 456 7890', true)
ON CONFLICT DO NOTHING;

-- Insert dummy products first
INSERT INTO public.products (name, unit_type, unit_size, packages_per_batch, shelf_life_days, active) VALUES
('Tomato Soup', 'liters', 1.0, 10, 7, true),
('Chicken Curry', 'kg', 0.5, 20, 5, true),
('Vegetable Stir Fry', 'portions', 1.0, 15, 3, true),
('Beef Stew', 'kg', 0.8, 12, 6, true),
('Fish Fillet', 'pieces', 0.2, 25, 2, true)
ON CONFLICT DO NOTHING;

-- Insert dummy chefs
INSERT INTO public.chefs (name, location, active) VALUES
('Chef Pierre', 'tothai'::location_type, true),
('Chef Anna', 'khin'::location_type, true),
('Chef Marco', 'tothai'::location_type, true)
ON CONFLICT DO NOTHING;

-- Insert dummy production batches with proper references
WITH product_ids AS (
  SELECT id, name FROM products WHERE name IN ('Tomato Soup', 'Chicken Curry', 'Vegetable Stir Fry', 'Beef Stew', 'Fish Fillet')
),
chef_ids AS (
  SELECT id, name FROM chefs WHERE name IN ('Chef Pierre', 'Chef Anna', 'Chef Marco')
)
INSERT INTO public.production_batches (
  product_id, 
  chef_id, 
  batch_number, 
  packages_produced, 
  production_date, 
  expiry_date, 
  location,
  production_notes
)
SELECT 
  p.id,
  c.id,
  generate_batch_number(p.name, CURRENT_DATE),
  CASE p.name
    WHEN 'Tomato Soup' THEN 50
    WHEN 'Chicken Curry' THEN 30
    WHEN 'Vegetable Stir Fry' THEN 40
    WHEN 'Beef Stew' THEN 25
    WHEN 'Fish Fillet' THEN 60
  END,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '5 days',
  CASE 
    WHEN c.name = 'Chef Anna' THEN 'khin'::location_type
    ELSE 'tothai'::location_type
  END,
  'Test batch for demo purposes'
FROM product_ids p
CROSS JOIN chef_ids c
WHERE NOT EXISTS (
  SELECT 1 FROM production_batches pb 
  WHERE pb.product_id = p.id 
  AND pb.production_date = CURRENT_DATE
)
LIMIT 8;
