-- Clean database but keep one example in each table
-- Handle foreign key constraints by cleaning dependent tables first

-- Clean dependent tables first
DELETE FROM batch_labels WHERE id NOT IN (SELECT id FROM batch_labels LIMIT 1);
DELETE FROM dispatch_items WHERE id NOT IN (SELECT id FROM dispatch_items LIMIT 1);
DELETE FROM product_cost_history WHERE id NOT IN (SELECT id FROM product_cost_history LIMIT 1);

-- Clean main tables with foreign key relationships
DELETE FROM cleaning_tasks WHERE id NOT IN (SELECT id FROM cleaning_tasks LIMIT 1);
DELETE FROM production_batches WHERE id NOT IN (SELECT id FROM production_batches LIMIT 1);
DELETE FROM dispatch_records WHERE id NOT IN (SELECT id FROM dispatch_records LIMIT 1);
DELETE FROM packing_slips WHERE id NOT IN (SELECT id FROM packing_slips LIMIT 1);

-- Clean lookup/master tables last
DELETE FROM cleaning_task_templates WHERE id NOT IN (SELECT id FROM cleaning_task_templates LIMIT 1);
DELETE FROM products WHERE id NOT IN (SELECT id FROM products LIMIT 1);
DELETE FROM customers WHERE id NOT IN (SELECT id FROM customers LIMIT 1);
DELETE FROM staff_codes WHERE code NOT IN (SELECT code FROM staff_codes LIMIT 1);
DELETE FROM suppliers WHERE id NOT IN (SELECT id FROM suppliers LIMIT 1);
DELETE FROM chefs WHERE id NOT IN (SELECT id FROM chefs LIMIT 1);

-- Clean audit logs - keep only 5 recent ones
DELETE FROM audit_logs WHERE id NOT IN (SELECT id FROM audit_logs ORDER BY created_at DESC LIMIT 5);