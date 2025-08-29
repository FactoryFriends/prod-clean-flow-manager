-- Add manual stock adjustment field to production_batches table
ALTER TABLE public.production_batches 
ADD COLUMN manual_stock_adjustment INTEGER DEFAULT 0,
ADD COLUMN adjusted_by TEXT,
ADD COLUMN adjustment_reason TEXT,
ADD COLUMN adjustment_timestamp TIMESTAMP WITH TIME ZONE;

-- Create function to calculate actual remaining stock
CREATE OR REPLACE FUNCTION public.get_batch_remaining_stock(batch_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
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