
-- Enable RLS and add permissive policies for key tables

-- 1. suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public insert" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public update" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public delete" ON public.suppliers;
CREATE POLICY "Allow public select" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.suppliers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.suppliers FOR DELETE USING (true);

-- 2. products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.products;
DROP POLICY IF EXISTS "Allow public insert" ON public.products;
DROP POLICY IF EXISTS "Allow public update" ON public.products;
DROP POLICY IF EXISTS "Allow public delete" ON public.products;
CREATE POLICY "Allow public select" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.products FOR DELETE USING (true);

-- 3. staff_codes
ALTER TABLE public.staff_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.staff_codes;
DROP POLICY IF EXISTS "Allow public insert" ON public.staff_codes;
DROP POLICY IF EXISTS "Allow public update" ON public.staff_codes;
DROP POLICY IF EXISTS "Allow public delete" ON public.staff_codes;
CREATE POLICY "Allow public select" ON public.staff_codes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.staff_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.staff_codes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.staff_codes FOR DELETE USING (true);

-- 4. cleaning_tasks
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Allow public insert" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Allow public update" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Allow public delete" ON public.cleaning_tasks;
CREATE POLICY "Allow public select" ON public.cleaning_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.cleaning_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.cleaning_tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.cleaning_tasks FOR DELETE USING (true);

-- 5. cleaning_task_templates
ALTER TABLE public.cleaning_task_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.cleaning_task_templates;
DROP POLICY IF EXISTS "Allow public insert" ON public.cleaning_task_templates;
DROP POLICY IF EXISTS "Allow public update" ON public.cleaning_task_templates;
DROP POLICY IF EXISTS "Allow public delete" ON public.cleaning_task_templates;
CREATE POLICY "Allow public select" ON public.cleaning_task_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.cleaning_task_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.cleaning_task_templates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.cleaning_task_templates FOR DELETE USING (true);

-- 6. production_batches
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.production_batches;
DROP POLICY IF EXISTS "Allow public insert" ON public.production_batches;
DROP POLICY IF EXISTS "Allow public update" ON public.production_batches;
DROP POLICY IF EXISTS "Allow public delete" ON public.production_batches;
CREATE POLICY "Allow public select" ON public.production_batches FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.production_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.production_batches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.production_batches FOR DELETE USING (true);

-- 7. batch_labels
ALTER TABLE public.batch_labels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.batch_labels;
DROP POLICY IF EXISTS "Allow public insert" ON public.batch_labels;
DROP POLICY IF EXISTS "Allow public update" ON public.batch_labels;
DROP POLICY IF EXISTS "Allow public delete" ON public.batch_labels;
CREATE POLICY "Allow public select" ON public.batch_labels FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.batch_labels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.batch_labels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.batch_labels FOR DELETE USING (true);

-- 8. packing_slips
ALTER TABLE public.packing_slips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.packing_slips;
DROP POLICY IF EXISTS "Allow public insert" ON public.packing_slips;
DROP POLICY IF EXISTS "Allow public update" ON public.packing_slips;
DROP POLICY IF EXISTS "Allow public delete" ON public.packing_slips;
CREATE POLICY "Allow public select" ON public.packing_slips FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.packing_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.packing_slips FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.packing_slips FOR DELETE USING (true);

-- 9. product_cost_history
ALTER TABLE public.product_cost_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.product_cost_history;
DROP POLICY IF EXISTS "Allow public insert" ON public.product_cost_history;
DROP POLICY IF EXISTS "Allow public update" ON public.product_cost_history;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_cost_history;
CREATE POLICY "Allow public select" ON public.product_cost_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.product_cost_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.product_cost_history FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.product_cost_history FOR DELETE USING (true);

-- 10. chefs
ALTER TABLE public.chefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.chefs;
DROP POLICY IF EXISTS "Allow public insert" ON public.chefs;
DROP POLICY IF EXISTS "Allow public update" ON public.chefs;
DROP POLICY IF EXISTS "Allow public delete" ON public.chefs;
CREATE POLICY "Allow public select" ON public.chefs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.chefs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.chefs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.chefs FOR DELETE USING (true);
