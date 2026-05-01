-- Step 1: log every empty batch to audit_logs
INSERT INTO public.audit_logs (
  action_type, action_description, reference_type, reference_id,
  staff_name, favv_relevant, metadata
)
SELECT
  'batch_deleted',
  'Empty batch deleted (double-submit cleanup): ' || pb.batch_number,
  'production_batch',
  pb.id,
  'System (migration cleanup-empty-batches)',
  false,
  jsonb_build_object(
    'batch_number', pb.batch_number,
    'reason', 'packages_produced = 0, no dispatches - caused by double-submit bug',
    'location', pb.location,
    'original_created_at', pb.created_at,
    'deleted_at', NOW()
  )
FROM public.production_batches pb
WHERE pb.packages_produced = 0
  AND COALESCE(pb.manual_stock_adjustment, 0) = 0
  AND NOT EXISTS (
    SELECT 1 FROM public.dispatch_items di
    WHERE di.item_id = pb.id::text AND di.item_type = 'batch'
  );

-- Step 2: delete the empty batches
DELETE FROM public.production_batches pb
WHERE pb.packages_produced = 0
  AND COALESCE(pb.manual_stock_adjustment, 0) = 0
  AND NOT EXISTS (
    SELECT 1 FROM public.dispatch_items di
    WHERE di.item_id = pb.id::text AND di.item_type = 'batch'
  );