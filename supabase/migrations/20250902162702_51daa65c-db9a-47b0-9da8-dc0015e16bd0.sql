-- Restore semi-finished stock to 2 PM state
-- Step 1: Remove test internal dispatch items first (foreign key constraint)
DELETE FROM dispatch_items 
WHERE dispatch_id IN (
  SELECT id FROM dispatch_records 
  WHERE dispatch_type = 'INTERNAL' 
  AND created_at > '2025-09-02 14:00:00'
);

-- Step 2: Remove test internal dispatch records
DELETE FROM dispatch_records 
WHERE dispatch_type = 'INTERNAL' 
AND created_at > '2025-09-02 14:00:00';

-- Step 3: Reset manual stock adjustment for TOM-20250829-001 back to 0
UPDATE production_batches 
SET manual_stock_adjustment = 0 
WHERE id = 'TOM-20250829-001';

-- Step 4: Add audit log entries for the restoration
INSERT INTO audit_logs (
  action_type, 
  action_description, 
  staff_code, 
  staff_name, 
  location, 
  reference_type, 
  metadata, 
  favv_relevant
) VALUES 
(
  'system', 
  'Removed test internal dispatch records and restored semi-finished stock levels to 2 PM state', 
  'SYSTEM', 
  'System Administrator', 
  'tothai', 
  'stock_restoration', 
  '{"restoration_time": "2025-09-02 14:00:00", "batches_affected": ["TOM-20250829-001"], "action": "test_cleanup"}', 
  true
),
(
  'production', 
  'Reset manual stock adjustment for batch TOM-20250829-001 from 6 to 0 packages', 
  'SYSTEM', 
  'System Administrator', 
  'tothai', 
  'batch', 
  '{"batch_id": "TOM-20250829-001", "previous_adjustment": 6, "new_adjustment": 0}', 
  true
);