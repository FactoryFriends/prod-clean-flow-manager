-- Fix race condition in batch number generation by adding advisory locks
-- This ensures only one request can generate a batch number for a product+date at a time

CREATE OR REPLACE FUNCTION generate_batch_number(
  product_name TEXT,
  production_date DATE
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  date_str TEXT;
  sequence_num INTEGER;
  batch_num TEXT;
  lock_key BIGINT;
BEGIN
  -- Create a unique lock key from product_name and date
  -- Use hashtext to convert string to integer for locking
  lock_key := hashtext(product_name || production_date::TEXT);
  
  -- Acquire advisory lock (will wait if another transaction holds it)
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Generate prefix from product name (first 3 chars, uppercase)
  prefix := UPPER(LEFT(product_name, 3));
  
  -- Format date as YYMMDD
  date_str := TO_CHAR(production_date, 'YYMMDD');
  
  -- Get the maximum sequence number for this product and date
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(batch_number FROM LENGTH(prefix || date_str) + 1) 
      AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM production_batches
  WHERE batch_number LIKE prefix || date_str || '%';
  
  -- Combine to create batch number: PREFIX + YYMMDD + SEQ
  batch_num := prefix || date_str || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN batch_num;
  
  -- Lock is automatically released at end of transaction
END;
$$;