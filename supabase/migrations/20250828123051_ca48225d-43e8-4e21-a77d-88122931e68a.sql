-- Update RLS policies for products and production_batches to allow public access
-- since we removed authentication requirements

-- Drop existing restrictive policies for products
DROP POLICY IF EXISTS "Admin users can view products" ON products;
DROP POLICY IF EXISTS "Admin users can create products" ON products;
DROP POLICY IF EXISTS "Admin users can update products" ON products;
DROP POLICY IF EXISTS "Admin users can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;

-- Create public access policies for products
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to products"
ON products FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing restrictive policies for production_batches
DROP POLICY IF EXISTS "Admin users can delete production batches" ON production_batches;
DROP POLICY IF EXISTS "Authenticated users can create production batches" ON production_batches;
DROP POLICY IF EXISTS "Authenticated users can update production batches" ON production_batches;
DROP POLICY IF EXISTS "Authenticated users can view production batches" ON production_batches;

-- Create public access policies for production_batches
CREATE POLICY "Allow public read access to production batches"
ON production_batches FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to production batches"
ON production_batches FOR ALL
USING (true)
WITH CHECK (true);

-- Also update chefs table policies for completeness
DROP POLICY IF EXISTS "Admin users can view chefs" ON chefs;
DROP POLICY IF EXISTS "Admin users can create chefs" ON chefs;
DROP POLICY IF EXISTS "Admin users can update chefs" ON chefs;
DROP POLICY IF EXISTS "Admin users can delete chefs" ON chefs;
DROP POLICY IF EXISTS "Authenticated users can view chefs" ON chefs;

-- Create public access policies for chefs
CREATE POLICY "Allow public read access to chefs"
ON chefs FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to chefs"
ON chefs FOR ALL
USING (true)
WITH CHECK (true);