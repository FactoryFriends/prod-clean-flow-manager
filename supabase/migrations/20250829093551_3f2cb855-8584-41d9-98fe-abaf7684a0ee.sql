-- Add a column to store the detailed item information including quantities
ALTER TABLE packing_slips 
ADD COLUMN item_details JSONB;

-- Add a comment to explain the structure
COMMENT ON COLUMN packing_slips.item_details IS 'Stores detailed information about items in the packing slip including quantities, batch numbers, and product details';

-- Update existing records to have empty array for item_details
UPDATE packing_slips 
SET item_details = '[]'::jsonb 
WHERE item_details IS NULL;