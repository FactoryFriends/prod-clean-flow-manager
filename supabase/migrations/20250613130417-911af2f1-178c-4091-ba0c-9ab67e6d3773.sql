
-- Create dispatch_records table for external dispatches
CREATE TABLE public.dispatch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_type TEXT NOT NULL CHECK (dispatch_type IN ('external', 'internal')),
  customer TEXT, -- Only for external dispatches
  picker_code TEXT NOT NULL,
  picker_name TEXT NOT NULL,
  dispatch_notes TEXT,
  total_items INTEGER NOT NULL DEFAULT 0,
  total_packages INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL CHECK (location IN ('tothai', 'khin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispatch_items table to track individual items in each dispatch
CREATE TABLE public.dispatch_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_id UUID NOT NULL REFERENCES public.dispatch_records(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- batch ID or external product ID
  item_type TEXT NOT NULL CHECK (item_type IN ('batch', 'external')),
  item_name TEXT NOT NULL,
  batch_number TEXT, -- Only for batch items
  quantity INTEGER NOT NULL,
  production_date DATE, -- Only for batch items
  expiry_date DATE, -- Only for batch items
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update packing_slips table to reference dispatch_records
ALTER TABLE public.packing_slips 
ADD COLUMN dispatch_id UUID REFERENCES public.dispatch_records(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_dispatch_records_location ON public.dispatch_records(location);
CREATE INDEX idx_dispatch_records_created_at ON public.dispatch_records(created_at);
CREATE INDEX idx_dispatch_items_dispatch_id ON public.dispatch_items(dispatch_id);
CREATE INDEX idx_dispatch_items_item_id ON public.dispatch_items(item_id);

-- Enable RLS on both tables
ALTER TABLE public.dispatch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all access for now since no auth is implemented)
CREATE POLICY "Allow all operations on dispatch_records" ON public.dispatch_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on dispatch_items" ON public.dispatch_items FOR ALL USING (true);

-- Function to update inventory when dispatch is created
CREATE OR REPLACE FUNCTION public.update_inventory_on_dispatch()
RETURNS TRIGGER AS $$
BEGIN
  -- For batch items, reduce the packages_produced count
  IF NEW.item_type = 'batch' THEN
    UPDATE public.production_batches 
    SET packages_produced = packages_produced - NEW.quantity
    WHERE id::text = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update inventory when dispatch items are added
CREATE TRIGGER trigger_update_inventory_on_dispatch
  AFTER INSERT ON public.dispatch_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_on_dispatch();
