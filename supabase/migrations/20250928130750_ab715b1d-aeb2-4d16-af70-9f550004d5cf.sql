-- Fix RPC functions to only count draft dispatch items, since confirmed ones are already subtracted from packages_produced

CREATE OR REPLACE FUNCTION public.get_batch_remaining_stock(batch_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  batch_record RECORD;
  reserved_quantity INTEGER;
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
  
  -- Get total reserved quantity (only draft dispatches, confirmed ones are already subtracted from packages_produced)
  SELECT COALESCE(SUM(di.quantity), 0)
  INTO reserved_quantity
  FROM public.dispatch_items di
  JOIN public.dispatch_records dr ON di.dispatch_id = dr.id
  WHERE di.item_id = batch_id_param::text 
  AND di.item_type = 'batch'
  AND dr.status = 'draft';
  
  -- Calculate remaining stock: current production + manual adjustments - reserved (draft only)
  remaining_stock := batch_record.packages_produced + COALESCE(batch_record.adjustment, 0) - reserved_quantity;
  
  RETURN GREATEST(0, remaining_stock);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_batch_free_stock_excluding_dispatch(batch_id_param uuid, exclude_dispatch_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  batch_record RECORD;
  reserved_quantity INTEGER;
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
  
  -- Get total reserved quantity excluding the specified dispatch (only draft dispatches)
  SELECT COALESCE(SUM(di.quantity), 0)
  INTO reserved_quantity
  FROM public.dispatch_items di
  JOIN public.dispatch_records dr ON di.dispatch_id = dr.id
  WHERE di.item_id = batch_id_param::text 
  AND di.item_type = 'batch'
  AND dr.status = 'draft'
  AND di.dispatch_id != exclude_dispatch_id_param;
  
  -- Calculate remaining stock: current production + manual adjustments - other reservations
  remaining_stock := batch_record.packages_produced + COALESCE(batch_record.adjustment, 0) - reserved_quantity;
  
  RETURN GREATEST(0, remaining_stock);
END;
$function$;