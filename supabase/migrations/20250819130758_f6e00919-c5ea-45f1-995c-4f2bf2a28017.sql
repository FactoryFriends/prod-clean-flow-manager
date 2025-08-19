-- Delete all test data related to production batches
-- First delete batch labels that reference production batches
DELETE FROM batch_labels;

-- Delete dispatch items that reference production batches
DELETE FROM dispatch_items WHERE item_type = 'batch';

-- Now delete all production batches
DELETE FROM production_batches;