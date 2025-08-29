-- Add status column to dispatch_records table
ALTER TABLE public.dispatch_records 
ADD COLUMN status text NOT NULL DEFAULT 'draft';

-- Add check constraint for valid status values
ALTER TABLE public.dispatch_records 
ADD CONSTRAINT dispatch_records_status_check 
CHECK (status IN ('draft', 'confirmed', 'shipped'));

-- Update existing records to 'confirmed' status (assuming they were already processed)
UPDATE public.dispatch_records 
SET status = 'confirmed' 
WHERE status = 'draft';

-- Create or replace the inventory update trigger to only run for confirmed dispatches
CREATE OR REPLACE FUNCTION public.update_inventory_on_dispatch()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  current_stock INTEGER;
  dispatch_status TEXT;
BEGIN
  -- Get the dispatch status
  SELECT status INTO dispatch_status
  FROM public.dispatch_records 
  WHERE id = NEW.dispatch_id;
  
  -- Only update inventory if dispatch is confirmed
  IF dispatch_status = 'confirmed' THEN
    -- For batch items, check available stock and reduce the packages_produced count
    IF NEW.item_type = 'batch' THEN
      -- Get current stock level
      SELECT packages_produced INTO current_stock
      FROM public.production_batches 
      WHERE id::text = NEW.item_id;
      
      -- Check if we have enough stock
      IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, NEW.quantity;
      END IF;
      
      -- Update stock only if we have enough
      UPDATE public.production_batches 
      SET packages_produced = packages_produced - NEW.quantity
      WHERE id::text = NEW.item_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create function to update inventory when dispatch status changes to confirmed
CREATE OR REPLACE FUNCTION public.update_inventory_on_dispatch_confirmation()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  item_rec RECORD;
  current_stock INTEGER;
BEGIN
  -- Only process when status changes from draft to confirmed
  IF OLD.status = 'draft' AND NEW.status = 'confirmed' THEN
    -- Update inventory for all items in this dispatch
    FOR item_rec IN 
      SELECT * FROM public.dispatch_items WHERE dispatch_id = NEW.id
    LOOP
      -- For batch items, check available stock and reduce the packages_produced count
      IF item_rec.item_type = 'batch' THEN
        -- Get current stock level
        SELECT packages_produced INTO current_stock
        FROM public.production_batches 
        WHERE id::text = item_rec.item_id;
        
        -- Check if we have enough stock
        IF current_stock < item_rec.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for item %. Available: %, Requested: %', 
            item_rec.item_name, current_stock, item_rec.quantity;
        END IF;
        
        -- Update stock only if we have enough
        UPDATE public.production_batches 
        SET packages_produced = packages_produced - item_rec.quantity
        WHERE id::text = item_rec.item_id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for dispatch status changes
CREATE TRIGGER trigger_update_inventory_on_confirmation
  BEFORE UPDATE ON public.dispatch_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_on_dispatch_confirmation();