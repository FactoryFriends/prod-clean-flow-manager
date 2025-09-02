-- Remove test internal dispatch records (corrected case sensitivity)
-- Step 1: Remove test internal dispatch items first (foreign key constraint)
DELETE FROM dispatch_items 
WHERE dispatch_id IN (
  SELECT id FROM dispatch_records 
  WHERE dispatch_type = 'internal' 
  AND created_at > '2025-09-02 14:00:00'
);

-- Step 2: Remove test internal dispatch records
DELETE FROM dispatch_records 
WHERE dispatch_type = 'internal' 
AND created_at > '2025-09-02 14:00:00';

-- Step 3: Add audit log entry for the cleanup
INSERT INTO audit_logs (
  action_type, 
  action_description, 
  staff_code, 
  staff_name, 
  location, 
  reference_type, 
  metadata, 
  favv_relevant
) VALUES (
  'system', 
  'Removed test internal dispatch records created after 2 PM (corrected case sensitivity)', 
  'SYSTEM', 
  'System Administrator', 
  'tothai', 
  'cleanup', 
  '{"cleanup_time": "2025-09-02 16:30:00", "dispatch_type": "internal", "affected_records": 2, "action": "test_cleanup_corrected"}', 
  true
);