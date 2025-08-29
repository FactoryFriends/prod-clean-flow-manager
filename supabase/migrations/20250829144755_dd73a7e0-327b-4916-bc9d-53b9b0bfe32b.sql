-- Allow slip_number to be null for draft packing slips
ALTER TABLE public.packing_slips 
ALTER COLUMN slip_number DROP NOT NULL;