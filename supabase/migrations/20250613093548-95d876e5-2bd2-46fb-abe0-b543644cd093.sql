
-- Create products masterdata table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit_size DECIMAL(10,2) NOT NULL, -- e.g., 4.0 for 4 liter
  unit_type TEXT NOT NULL, -- e.g., 'liter', 'kg', 'pieces'
  packages_per_batch INTEGER NOT NULL DEFAULT 1, -- how many packages from one batch
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Create chefs masterdata table
CREATE TABLE public.chefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location location_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create production batches table
CREATE TABLE public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT NOT NULL UNIQUE, -- e.g., PTB-20250608-001
  product_id UUID NOT NULL REFERENCES public.products(id),
  chef_id UUID NOT NULL REFERENCES public.chefs(id),
  packages_produced INTEGER NOT NULL,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  production_notes TEXT,
  location location_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create labels table for tracking printed labels
CREATE TABLE public.batch_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.production_batches(id),
  label_number INTEGER NOT NULL, -- 1, 2, 3... for each package in batch
  qr_code_data JSONB NOT NULL, -- stores all QR code information
  printed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packing slips table
CREATE TABLE public.packing_slips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slip_number TEXT NOT NULL UNIQUE, -- e.g., PS-20250608-001
  destination TEXT NOT NULL, -- e.g., "KHIN Takeaway"
  batch_ids UUID[] NOT NULL, -- array of batch IDs included in this shipment
  prepared_by TEXT,
  picked_up_by TEXT,
  pickup_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_items INTEGER NOT NULL DEFAULT 0,
  total_packages INTEGER NOT NULL DEFAULT 0
);

-- Add some sample data for products
INSERT INTO public.products (name, unit_size, unit_type, packages_per_batch) VALUES
('Pad Thai Base', 4.0, 'liter', 5),
('Tom Yum Paste', 2.0, 'liter', 8),
('Green Curry Base', 3.0, 'liter', 6),
('Red Curry Paste', 1.5, 'liter', 10);

-- Add sample chefs
INSERT INTO public.chefs (name, location) VALUES
('Chef Tom', 'tothai'),
('Chef Sarah', 'tothai'),
('Chef Mike', 'khin');

-- Function to generate batch number
CREATE OR REPLACE FUNCTION generate_batch_number(product_name TEXT, production_date DATE)
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  product_prefix TEXT;
  sequence_num INTEGER;
  batch_number TEXT;
BEGIN
  -- Format date as YYYYMMDD
  date_str := TO_CHAR(production_date, 'YYYYMMDD');
  
  -- Get product prefix (first 3 letters, uppercase)
  product_prefix := UPPER(LEFT(REPLACE(product_name, ' ', ''), 3));
  
  -- Get next sequence number for this date and product
  SELECT COALESCE(MAX(
    CAST(RIGHT(batch_number, 3) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.production_batches pb
  JOIN public.products p ON pb.product_id = p.id
  WHERE pb.production_date = production_date
  AND p.name = product_name;
  
  -- Generate batch number: PREFIX-YYYYMMDD-XXX
  batch_number := product_prefix || '-' || date_str || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN batch_number;
END;
$$ LANGUAGE plpgsql;
