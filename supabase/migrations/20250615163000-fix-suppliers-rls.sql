
-- Enable RLS on suppliers table if not already enabled
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow full access to suppliers" ON public.suppliers;

-- Create policy that allows authenticated users to read suppliers
CREATE POLICY "Allow authenticated read suppliers" 
  ON public.suppliers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy that allows authenticated users to insert suppliers
CREATE POLICY "Allow authenticated insert suppliers" 
  ON public.suppliers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create policy that allows authenticated users to update suppliers
CREATE POLICY "Allow authenticated update suppliers" 
  ON public.suppliers 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create policy that allows authenticated users to delete suppliers (though we use soft delete via active field)
CREATE POLICY "Allow authenticated delete suppliers" 
  ON public.suppliers 
  FOR DELETE 
  TO authenticated 
  USING (true);
