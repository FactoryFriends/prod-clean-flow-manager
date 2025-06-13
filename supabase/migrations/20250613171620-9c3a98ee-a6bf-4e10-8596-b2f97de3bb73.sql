
-- Create hooks and mutations for staff codes management
-- The staff_codes table already exists, so we'll add any missing functionality

-- Add updated_at column if it doesn't exist
ALTER TABLE public.staff_codes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for staff_codes table
DROP TRIGGER IF EXISTS update_staff_codes_updated_at ON public.staff_codes;
CREATE TRIGGER update_staff_codes_updated_at
    BEFORE UPDATE ON public.staff_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
