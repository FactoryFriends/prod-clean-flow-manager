-- Remove authentication requirements from all tables to fix data flow issues

-- Update unit_options policies
DROP POLICY IF EXISTS "Admin users can create unit options" ON unit_options;
DROP POLICY IF EXISTS "Admin users can delete unit options" ON unit_options;
DROP POLICY IF EXISTS "Admin users can update unit options" ON unit_options;
DROP POLICY IF EXISTS "Authenticated users can view unit options" ON unit_options;

CREATE POLICY "Allow public read access to unit options"
ON unit_options FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to unit options"
ON unit_options FOR ALL
USING (true)
WITH CHECK (true);

-- Update suppliers policies
DROP POLICY IF EXISTS "Admin users can create suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin users can delete suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin users can view suppliers" ON suppliers;

CREATE POLICY "Allow public read access to suppliers"
ON suppliers FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to suppliers"
ON suppliers FOR ALL
USING (true)
WITH CHECK (true);

-- Update product_cost_history policies
DROP POLICY IF EXISTS "Admin users can create product cost history" ON product_cost_history;
DROP POLICY IF EXISTS "Admin users can delete product cost history" ON product_cost_history;
DROP POLICY IF EXISTS "Admin users can update product cost history" ON product_cost_history;
DROP POLICY IF EXISTS "Admin users can view product cost history" ON product_cost_history;

CREATE POLICY "Allow public read access to product cost history"
ON product_cost_history FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to product cost history"
ON product_cost_history FOR ALL
USING (true)
WITH CHECK (true);

-- Update dispatch_records policies
DROP POLICY IF EXISTS "Admin users can delete dispatch records" ON dispatch_records;
DROP POLICY IF EXISTS "Authenticated users can create dispatch records" ON dispatch_records;
DROP POLICY IF EXISTS "Authenticated users can update dispatch records" ON dispatch_records;
DROP POLICY IF EXISTS "Authenticated users can view dispatch records" ON dispatch_records;

CREATE POLICY "Allow public read access to dispatch records"
ON dispatch_records FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to dispatch records"
ON dispatch_records FOR ALL
USING (true)
WITH CHECK (true);

-- Update packing_slips policies
DROP POLICY IF EXISTS "Admin users can delete packing slips" ON packing_slips;
DROP POLICY IF EXISTS "Authenticated users can create packing slips" ON packing_slips;
DROP POLICY IF EXISTS "Authenticated users can update packing slips" ON packing_slips;
DROP POLICY IF EXISTS "Authenticated users can view packing slips" ON packing_slips;

CREATE POLICY "Allow public read access to packing slips"
ON packing_slips FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to packing slips"
ON packing_slips FOR ALL
USING (true)
WITH CHECK (true);

-- Update cleaning_tasks policies
DROP POLICY IF EXISTS "Admin users can delete cleaning tasks" ON cleaning_tasks;
DROP POLICY IF EXISTS "Authenticated users can create cleaning tasks" ON cleaning_tasks;
DROP POLICY IF EXISTS "Authenticated users can update cleaning tasks" ON cleaning_tasks;
DROP POLICY IF EXISTS "Authenticated users can view cleaning tasks" ON cleaning_tasks;

CREATE POLICY "Allow public read access to cleaning tasks"
ON cleaning_tasks FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to cleaning tasks"
ON cleaning_tasks FOR ALL
USING (true)
WITH CHECK (true);

-- Update audit_logs policies
DROP POLICY IF EXISTS "Admin users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;

CREATE POLICY "Allow public read access to audit logs"
ON audit_logs FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to audit logs"
ON audit_logs FOR ALL
USING (true)
WITH CHECK (true);

-- Update cleaning_task_templates policies
DROP POLICY IF EXISTS "Admin users can create cleaning task templates" ON cleaning_task_templates;
DROP POLICY IF EXISTS "Admin users can delete cleaning task templates" ON cleaning_task_templates;
DROP POLICY IF EXISTS "Admin users can update cleaning task templates" ON cleaning_task_templates;
DROP POLICY IF EXISTS "Authenticated users can view cleaning task templates" ON cleaning_task_templates;

CREATE POLICY "Allow public read access to cleaning task templates"
ON cleaning_task_templates FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to cleaning task templates"
ON cleaning_task_templates FOR ALL
USING (true)
WITH CHECK (true);

-- Update dispatch_items policies
DROP POLICY IF EXISTS "Admin users can delete dispatch items" ON dispatch_items;
DROP POLICY IF EXISTS "Authenticated users can create dispatch items" ON dispatch_items;
DROP POLICY IF EXISTS "Authenticated users can update dispatch items" ON dispatch_items;
DROP POLICY IF EXISTS "Authenticated users can view dispatch items" ON dispatch_items;

CREATE POLICY "Allow public read access to dispatch items"
ON dispatch_items FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to dispatch items"
ON dispatch_items FOR ALL
USING (true)
WITH CHECK (true);

-- Update batch_labels policies
DROP POLICY IF EXISTS "Admin users can delete batch labels" ON batch_labels;
DROP POLICY IF EXISTS "Authenticated users can create batch labels" ON batch_labels;
DROP POLICY IF EXISTS "Authenticated users can update batch labels" ON batch_labels;
DROP POLICY IF EXISTS "Authenticated users can view batch labels" ON batch_labels;

CREATE POLICY "Allow public read access to batch labels"
ON batch_labels FOR SELECT
USING (true);

CREATE POLICY "Allow public write access to batch labels"
ON batch_labels FOR ALL
USING (true)
WITH CHECK (true);