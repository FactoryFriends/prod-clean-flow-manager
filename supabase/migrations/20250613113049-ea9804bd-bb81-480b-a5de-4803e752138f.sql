
-- Fix the generate_batch_number function to resolve the ambiguous column reference
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
    CAST(RIGHT(pb.batch_number, 3) AS INTEGER)
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
