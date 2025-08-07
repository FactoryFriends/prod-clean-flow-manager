-- Clean database but keep one example in each table

-- Keep one chef
DELETE FROM chefs WHERE id NOT IN (SELECT id FROM chefs LIMIT 1);

-- Keep one supplier  
DELETE FROM suppliers WHERE id NOT IN (SELECT id FROM suppliers LIMIT 1);

-- Keep one product
DELETE FROM products WHERE id NOT IN (SELECT id FROM products LIMIT 1);

-- Keep one customer
DELETE FROM customers WHERE id NOT IN (SELECT id FROM customers LIMIT 1);

-- Keep one staff code
DELETE FROM staff_codes WHERE code NOT IN (SELECT code FROM staff_codes LIMIT 1);

-- Keep one cleaning task template
DELETE FROM cleaning_task_templates WHERE id NOT IN (SELECT id FROM cleaning_task_templates LIMIT 1);

-- Keep one production batch
DELETE FROM production_batches WHERE id NOT IN (SELECT id FROM production_batches LIMIT 1);

-- Keep one cleaning task
DELETE FROM cleaning_tasks WHERE id NOT IN (SELECT id FROM cleaning_tasks LIMIT 1);

-- Clean related tables (these depend on above tables)
DELETE FROM batch_labels WHERE batch_id NOT IN (SELECT id FROM production_batches);

-- Keep one dispatch record
DELETE FROM dispatch_records WHERE id NOT IN (SELECT id FROM dispatch_records LIMIT 1);

-- Clean dispatch items that reference deleted dispatches
DELETE FROM dispatch_items WHERE dispatch_id NOT IN (SELECT id FROM dispatch_records);

-- Keep one packing slip
DELETE FROM packing_slips WHERE id NOT IN (SELECT id FROM packing_slips LIMIT 1);

-- Clean product cost history for deleted products
DELETE FROM product_cost_history WHERE product_id NOT IN (SELECT id FROM products);

-- Clean audit logs - keep only recent ones
DELETE FROM audit_logs WHERE id NOT IN (SELECT id FROM audit_logs ORDER BY created_at DESC LIMIT 5);