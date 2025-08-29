-- Fix the search path security issue for the new function
CREATE OR REPLACE FUNCTION public.get_batch_remaining_stock(batch_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  batch_record RECORD;
  dispatched_quantity INTEGER;
  remaining_stock INTEGER;
BEGIN
  -- Get batch info
  SELECT packages_produced, manual_stock_adjustment, COALESCE(manual_stock_adjustment, 0) as adjustment
  INTO batch_record
  FROM public.production_batches
  WHERE id = batch_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Get total dispatched quantity
  SELECT COALESCE(SUM(quantity), 0)
  INTO dispatched_quantity
  FROM public.dispatch_items
  WHERE item_id = batch_id_param::text AND item_type = 'batch';
  
  -- Calculate remaining stock: original production + manual adjustments - dispatched
  remaining_stock := batch_record.packages_produced + COALESCE(batch_record.adjustment, 0) - dispatched_quantity;
  
  RETURN GREATEST(0, remaining_stock);
END;
$$;