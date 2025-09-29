-- Create a robust server-side function to cancel internal dispatches
CREATE OR REPLACE FUNCTION public.cancel_internal_dispatch(p_id uuid)
RETURNS TABLE(cancelled_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_row_id uuid;
BEGIN
  -- Update the dispatch record and get the ID if successful
  UPDATE public.dispatch_records 
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE 
    id = p_id 
    AND dispatch_type = 'internal' 
    AND status = 'draft'
  RETURNING id INTO updated_row_id;
  
  -- Return the updated row ID (or null if no rows were updated)
  IF updated_row_id IS NOT NULL THEN
    RETURN QUERY SELECT updated_row_id;
  ELSE
    RETURN;
  END IF;
END;
$function$;