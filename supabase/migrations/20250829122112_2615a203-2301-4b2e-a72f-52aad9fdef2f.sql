-- Update batch number generation to add "B-" prefix
-- This will change format from PREFIX-YYYYMMDD-XXX to B-PREFIX-YYYYMMDD-XXX

CREATE OR REPLACE FUNCTION public.generate_batch_number(product_name text, production_date date)
RETURNS text
LANGUAGE plpgsql
AS $function$
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
  -- Check both old format (PREFIX-YYYYMMDD-XXX) and new format (B-PREFIX-YYYYMMDD-XXX)
  SELECT COALESCE(MAX(
    CASE 
      WHEN LENGTH(pb.batch_number) >= 3 AND pb.batch_number ~ '-[0-9]{3}$' THEN
        CAST(RIGHT(pb.batch_number, 3) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM production_batches pb
  INNER JOIN products p ON pb.product_id = p.id
  WHERE pb.production_date = $2
  AND p.name = $1;
  
  -- Generate NEW batch number with B- prefix: B-PREFIX-YYYYMMDD-XXX
  batch_number := 'B-' || product_prefix || '-' || date_str || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN batch_number;
END;
$function$;