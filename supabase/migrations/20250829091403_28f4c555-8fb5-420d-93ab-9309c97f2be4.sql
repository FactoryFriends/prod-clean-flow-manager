-- Add check constraint to prevent negative packages_produced
ALTER TABLE production_batches 
ADD CONSTRAINT packages_produced_positive 
CHECK (packages_produced >= 0);

-- Add check constraint to prevent negative quantity in dispatch_items
ALTER TABLE dispatch_items 
ADD CONSTRAINT quantity_positive 
CHECK (quantity >= 0);

-- Update the inventory dispatch trigger to prevent negative stock
CREATE OR REPLACE FUNCTION public.update_inventory_on_dispatch()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  current_stock INTEGER;
BEGIN
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
  
  RETURN NEW;
END;
$function$;