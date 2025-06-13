
-- Create customers table for tracking dispatch recipients
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  customer_type text NOT NULL CHECK (customer_type IN ('restaurant', 'external')),
  contact_person text,
  email text,
  phone text,
  address text,
  delivery_instructions text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_type_active ON public.customers (customer_type, active);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (name);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to read customers
CREATE POLICY "Allow read access to customers" 
  ON public.customers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy that allows authenticated users to manage customers
CREATE POLICY "Allow full access to customers" 
  ON public.customers 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Insert default customers (the restaurant locations)
INSERT INTO public.customers (name, customer_type, contact_person, active) VALUES
('KHIN Takeaway', 'restaurant', 'Restaurant Manager', true),
('To Thai Restaurant', 'restaurant', 'Restaurant Manager', true)
ON CONFLICT DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_customers_updated_at_trigger
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();
