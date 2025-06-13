
-- Add status column to packing_slips table
ALTER TABLE public.packing_slips 
ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'shipped'));

-- Update existing records to have 'shipped' status (assuming they were already processed)
UPDATE public.packing_slips SET status = 'shipped' WHERE status IS NULL;
