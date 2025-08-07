-- Clean database tables step by step, respecting foreign key constraints

-- Step 1: Clear dependent tables completely first
DELETE FROM batch_labels;
DELETE FROM dispatch_items; 
DELETE FROM product_cost_history;

-- Step 2: Clear tables with foreign keys to master data
DELETE FROM cleaning_tasks;
DELETE FROM production_batches;
DELETE FROM dispatch_records;  
DELETE FROM packing_slips;

-- Step 3: Keep one record in each master table
DELETE FROM cleaning_task_templates WHERE id NOT IN (SELECT id FROM cleaning_task_templates LIMIT 1);
DELETE FROM products WHERE id NOT IN (SELECT id FROM products LIMIT 1);
DELETE FROM customers WHERE id NOT IN (SELECT id FROM customers LIMIT 1);
DELETE FROM staff_codes WHERE code NOT IN (SELECT code FROM staff_codes LIMIT 1);
DELETE FROM suppliers WHERE id NOT IN (SELECT id FROM suppliers LIMIT 1);
DELETE FROM chefs WHERE id NOT IN (SELECT id FROM chefs LIMIT 1);

-- Step 4: Keep minimal audit logs
DELETE FROM audit_logs WHERE id NOT IN (SELECT id FROM audit_logs ORDER BY created_at DESC LIMIT 3);