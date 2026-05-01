
-- =========================================================
-- 1. Add admin guards to SECURITY DEFINER user-management RPCs
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_user_role(p_profile_id uuid, p_role user_role)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_user_role(auth.uid()) <> 'admin'::public.user_role THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  UPDATE public.profiles 
  SET role = p_role, updated_at = now()
  WHERE profiles.id = p_profile_id
  RETURNING profiles.id, profiles.user_id, profiles.role, profiles.full_name, profiles.created_at, profiles.updated_at, profiles.created_by;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_profile(p_profile_id uuid, p_full_name text, p_role user_role, p_extended_session boolean DEFAULT NULL::boolean)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_user_role(auth.uid()) <> 'admin'::public.user_role THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  UPDATE public.profiles 
  SET 
    full_name = p_full_name,
    role = p_role, 
    extended_session = COALESCE(p_extended_session, profiles.extended_session),
    updated_at = now()
  WHERE profiles.id = p_profile_id
  RETURNING profiles.id, profiles.user_id, profiles.role, profiles.full_name, profiles.created_at, profiles.updated_at, profiles.created_by, profiles.extended_session;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_extended_session(p_profile_id uuid, p_extended_session boolean)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_user_role(auth.uid()) <> 'admin'::public.user_role THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  UPDATE public.profiles 
  SET 
    extended_session = p_extended_session,
    updated_at = now()
  WHERE profiles.id = p_profile_id
  RETURNING profiles.id, profiles.user_id, profiles.role, profiles.full_name, profiles.created_at, profiles.updated_at, profiles.created_by, profiles.extended_session;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profiles()
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, email text, extended_session boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_user_role(auth.uid()) <> 'admin'::public.user_role THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.role,
    p.full_name,
    p.created_at,
    p.updated_at,
    p.created_by,
    u.email::text,
    p.extended_session
  FROM public.profiles p
  JOIN auth.users u ON p.user_id = u.id
  ORDER BY p.created_at DESC;
END;
$function$;

-- =========================================================
-- 2. Replace public RLS policies with authenticated-only on operational tables
-- =========================================================

-- Helper macro pattern: drop public policies, create authenticated policies

-- chefs
DROP POLICY IF EXISTS "Allow public read access to chefs" ON public.chefs;
DROP POLICY IF EXISTS "Allow public write access to chefs" ON public.chefs;
CREATE POLICY "Authenticated can read chefs" ON public.chefs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write chefs" ON public.chefs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cleaning_task_templates
DROP POLICY IF EXISTS "Allow public read access to cleaning task templates" ON public.cleaning_task_templates;
DROP POLICY IF EXISTS "Allow public write access to cleaning task templates" ON public.cleaning_task_templates;
CREATE POLICY "Authenticated can read cleaning task templates" ON public.cleaning_task_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write cleaning task templates" ON public.cleaning_task_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cleaning_tasks
DROP POLICY IF EXISTS "Allow public read access to cleaning tasks" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Allow public write access to cleaning tasks" ON public.cleaning_tasks;
CREATE POLICY "Authenticated can read cleaning tasks" ON public.cleaning_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write cleaning tasks" ON public.cleaning_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- batch_labels
DROP POLICY IF EXISTS "Allow public read access to batch labels" ON public.batch_labels;
DROP POLICY IF EXISTS "Allow public write access to batch labels" ON public.batch_labels;
CREATE POLICY "Authenticated can read batch labels" ON public.batch_labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write batch labels" ON public.batch_labels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- packing_slips
DROP POLICY IF EXISTS "Allow public read access to packing slips" ON public.packing_slips;
DROP POLICY IF EXISTS "Allow public write access to packing slips" ON public.packing_slips;
CREATE POLICY "Authenticated can read packing slips" ON public.packing_slips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write packing slips" ON public.packing_slips FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- product_cost_history
DROP POLICY IF EXISTS "Allow public read access to product cost history" ON public.product_cost_history;
DROP POLICY IF EXISTS "Allow public write access to product cost history" ON public.product_cost_history;
CREATE POLICY "Authenticated can read product cost history" ON public.product_cost_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write product cost history" ON public.product_cost_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- dispatch_records
DROP POLICY IF EXISTS "Allow public read access to dispatch records" ON public.dispatch_records;
DROP POLICY IF EXISTS "Allow public write access to dispatch records" ON public.dispatch_records;
CREATE POLICY "Authenticated can read dispatch records" ON public.dispatch_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write dispatch records" ON public.dispatch_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- dispatch_items
DROP POLICY IF EXISTS "Allow public read access to dispatch items" ON public.dispatch_items;
DROP POLICY IF EXISTS "Allow public write access to dispatch items" ON public.dispatch_items;
CREATE POLICY "Authenticated can read dispatch items" ON public.dispatch_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write dispatch items" ON public.dispatch_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- unit_options
DROP POLICY IF EXISTS "Allow public read access to unit options" ON public.unit_options;
DROP POLICY IF EXISTS "Allow public write access to unit options" ON public.unit_options;
CREATE POLICY "Authenticated can read unit options" ON public.unit_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write unit options" ON public.unit_options FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- staff_codes
DROP POLICY IF EXISTS "Allow public read access to staff codes" ON public.staff_codes;
DROP POLICY IF EXISTS "Allow public write access to staff codes" ON public.staff_codes;
CREATE POLICY "Authenticated can read staff codes" ON public.staff_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write staff codes" ON public.staff_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- production_batches
DROP POLICY IF EXISTS "Allow public read access to production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Allow public write access to production batches" ON public.production_batches;
CREATE POLICY "Authenticated can read production batches" ON public.production_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write production batches" ON public.production_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- 3. customers — authenticated read, admin-only writes
-- =========================================================
DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public write access to customers" ON public.customers;
CREATE POLICY "Authenticated can read customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Admins can update customers" ON public.customers FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role) WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =========================================================
-- 4. products — authenticated read, admin-only writes
-- =========================================================
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public write access to products" ON public.products;
CREATE POLICY "Authenticated can read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role) WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
