
-- Bulk write-off: set all expired batches with positive stock to 0
-- First insert audit logs, then update the batches

WITH expired_batches AS (
  SELECT 
    pb.id,
    pb.batch_number,
    pb.packages_produced,
    COALESCE(pb.manual_stock_adjustment, 0) as current_adjustment,
    COALESCE((
      SELECT SUM(di.quantity) FROM public.dispatch_items di
      JOIN public.dispatch_records dr ON di.dispatch_id = dr.id
      WHERE di.item_id = pb.id::text AND di.item_type = 'batch' AND dr.status = 'draft'
    ), 0) as reserved,
    pb.packages_produced + COALESCE(pb.manual_stock_adjustment, 0) - COALESCE((
      SELECT SUM(di.quantity) FROM public.dispatch_items di
      JOIN public.dispatch_records dr ON di.dispatch_id = dr.id
      WHERE di.item_id = pb.id::text AND di.item_type = 'batch' AND dr.status = 'draft'
    ), 0) as old_stock
  FROM public.production_batches pb
  WHERE pb.expiry_date < CURRENT_DATE
    AND pb.packages_produced + COALESCE(pb.manual_stock_adjustment, 0) > 0
),
audit_insert AS (
  INSERT INTO public.audit_logs (action_type, action_description, reference_type, reference_id, staff_name, favv_relevant, metadata)
  SELECT 
    'stock_adjustment',
    'Bulk write-off expired batch ' || batch_number || ': stock ' || old_stock || ' → 0',
    'production_batch',
    id,
    'System (admin bulk write-off)',
    true,
    jsonb_build_object(
      'old_remaining_stock', old_stock,
      'new_remaining_stock', 0,
      'adjustment_reason', 'Stocktelling en oplossen software error',
      'old_adjustment', current_adjustment,
      'new_adjustment', reserved - packages_produced,
      'reserved_quantity', reserved,
      'packages_produced', packages_produced,
      'bulk_write_off', true
    )
  FROM expired_batches
  RETURNING reference_id
)
UPDATE public.production_batches pb
SET 
  manual_stock_adjustment = eb.reserved - eb.packages_produced,
  adjusted_by = 'System (admin bulk write-off)',
  adjustment_reason = 'Stocktelling en oplossen software error',
  adjustment_timestamp = NOW()
FROM expired_batches eb
WHERE pb.id = eb.id;
