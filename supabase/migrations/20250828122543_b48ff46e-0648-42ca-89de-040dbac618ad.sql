-- Update RLS policies to allow public access for staff codes and customers
-- since we removed authentication requirements

-- Drop existing restrictive policies for staff_codes
DROP POLICY IF EXISTS "Admin users can view staff codes" ON staff_codes;
DROP POLICY IF EXISTS "Admin users can create staff codes" ON staff_codes;
DROP POLICY IF EXISTS "Admin users can update staff codes" ON staff_codes;
DROP POLICY IF EXISTS "Admin users can delete staff codes" ON staff_codes;

-- Create public access policies for staff_codes
CREATE POLICY "Allow public read access to staff codes"
ON staff_codes FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to staff codes"
ON staff_codes FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing restrictive policies for customers
DROP POLICY IF EXISTS "Admin users can view customers" ON customers;
DROP POLICY IF EXISTS "Admin users can create customers" ON customers;
DROP POLICY IF EXISTS "Admin users can update customers" ON customers;  
DROP POLICY IF EXISTS "Admin users can delete customers" ON customers;

-- Create public access policies for customers
CREATE POLICY "Allow public read access to customers"
ON customers FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to customers"
ON customers FOR ALL
USING (true)
WITH CHECK (true);