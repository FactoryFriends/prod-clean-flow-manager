
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow full access to customers" ON public.customers;

-- Create new policies that allow anonymous access since this app doesn't use authentication
CREATE POLICY "Allow anonymous read access to customers" 
  ON public.customers 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous write access to customers" 
  ON public.customers 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to customers" 
  ON public.customers 
  FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to customers" 
  ON public.customers 
  FOR DELETE 
  TO anon, authenticated
  USING (true);
