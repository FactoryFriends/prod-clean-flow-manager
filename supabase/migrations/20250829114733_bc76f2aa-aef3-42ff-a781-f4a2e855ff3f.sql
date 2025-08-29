-- Clean Slate Migration: Remove all test data
-- This will delete all production batches, dispatch records, packing slips, and related data
-- while preserving configuration data (products, suppliers, customers, staff codes, etc.)

-- Step 1: Delete batch labels (references production_batches)
DELETE FROM public.batch_labels;

-- Step 2: Delete dispatch items (references dispatch_records)
DELETE FROM public.dispatch_items;

-- Step 3: Delete packing slips (references dispatch_records)
DELETE FROM public.packing_slips;

-- Step 4: Delete dispatch records (main dispatch data)
DELETE FROM public.dispatch_records;

-- Step 5: Delete production batches (main production data)
DELETE FROM public.production_batches;

-- Step 6: Clean audit logs (remove test operation trails)
DELETE FROM public.audit_logs;

-- Step 7: Clean product cost history (remove test price changes)
DELETE FROM public.product_cost_history;

-- Verification queries to confirm cleanup
-- These will show 0 records if cleanup was successful
SELECT 'batch_labels' as table_name, COUNT(*) as remaining_records FROM public.batch_labels
UNION ALL
SELECT 'dispatch_items', COUNT(*) FROM public.dispatch_items
UNION ALL
SELECT 'packing_slips', COUNT(*) FROM public.packing_slips
UNION ALL
SELECT 'dispatch_records', COUNT(*) FROM public.dispatch_records
UNION ALL
SELECT 'production_batches', COUNT(*) FROM public.production_batches
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs
UNION ALL
SELECT 'product_cost_history', COUNT(*) FROM public.product_cost_history;

-- Success message
SELECT 'Database cleaned successfully - ready for real inventory data!' as status;