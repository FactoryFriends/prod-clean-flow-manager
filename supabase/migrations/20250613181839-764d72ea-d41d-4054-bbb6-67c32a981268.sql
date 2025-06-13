
-- Insert customers including KHIN (without ON CONFLICT since there's no unique constraint on name)
INSERT INTO public.customers (name, customer_type, contact_person, email, phone, active) VALUES
('KHIN Restaurant', 'restaurant', 'Manager KHIN', 'manager@khin.com', '+32 2 123 4567', true),
('Restaurant De Kroon', 'restaurant', 'Chef De Kroon', 'chef@dekroon.be', '+32 2 234 5678', true),
('Bistro Central', 'external', 'Owner Central', 'info@bistrocentral.be', '+32 2 345 6789', true),
('Café Mozart', 'restaurant', 'Manager Mozart', 'contact@mozart.be', '+32 2 456 7890', true),
('To Thai Restaurant', 'restaurant', 'Restaurant Manager', 'info@tothai.be', '+32 2 567 8901', true);
