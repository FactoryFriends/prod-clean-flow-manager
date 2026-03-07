-- Clean up stale draft dispatch items first (referential integrity)
DELETE FROM public.dispatch_items 
WHERE dispatch_id IN (
  SELECT id FROM public.dispatch_records 
  WHERE status = 'draft'
);

-- Then delete the stale draft dispatch records
DELETE FROM public.dispatch_records 
WHERE status = 'draft';
