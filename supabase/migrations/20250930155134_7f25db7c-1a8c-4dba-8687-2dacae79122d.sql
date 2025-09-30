-- Add 'cancelled' to the allowed status values for dispatch_records
ALTER TABLE public.dispatch_records 
DROP CONSTRAINT IF EXISTS dispatch_records_status_check;

ALTER TABLE public.dispatch_records 
ADD CONSTRAINT dispatch_records_status_check 
CHECK (status IN ('draft', 'confirmed', 'cancelled', 'shipped'));