-- Create function to get batch free stock excluding a specific dispatch
CREATE OR REPLACE FUNCTION public.get_batch_free_stock_excluding_dispatch(batch_id_param uuid, exclude_dispatch_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Get total dispatched quantity excluding the specified dispatch
  SELECT COALESCE(SUM(quantity), 0)
  INTO dispatched_quantity
  FROM public.dispatch_items di
  JOIN public.dispatch_records dr ON di.dispatch_id = dr.id
  WHERE di.item_id = batch_id_param::text 
  AND di.item_type = 'batch'
  AND dr.status = 'confirmed'
  AND di.dispatch_id != exclude_dispatch_id_param;
  
  -- Calculate remaining stock: original production + manual adjustments - dispatched (excluding current dispatch)
  remaining_stock := batch_record.packages_produced + COALESCE(batch_record.adjustment, 0) - dispatched_quantity;
  
  RETURN GREATEST(0, remaining_stock);
END;
$function$;