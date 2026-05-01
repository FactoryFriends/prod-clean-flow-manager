WITH empty_batches AS (
  SELECT pb.id, pb.batch_number, pb.created_at, pb.location
  FROM public.production_batches pb
  WHERE pb.packages_produced = 0
    AND COALESCE(pb.manual_stock_adjustment, 0) = 0
    AND NOT EXISTS (
      SELECT 1 FROM public.dispatch_items di
      WHERE di.item_id = pb.id::text AND di.item_type = 'batch'
    )
),
audit_insert AS (
  INSERT INTO public.audit_logs (
    action_type, action_description, reference_type, reference_id,
    staff_name, favv_relevant, metadata
  )
  SELECT
    'batch_deleted',
    'Empty batch deleted (double-submit cleanup): ' || batch_number,
    'production_batch',
    id,
    'System (migration cleanup-empty-batches)',
    false,
    jsonb_build_object(
      'batch_number', batch_number,
      'reason', 'packages_produced = 0, no dispatches - caused by double-submit bug',
      'deleted_at', NOW()
    )
  FROM empty_batches
  RETURNING reference_id::uuid
)
DELETE FROM public.production_batches pb
USING empty_batches eb
WHERE pb.id = eb.id;