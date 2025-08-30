-- PHASE 1: Fix Critical Data Exposure - Replace public RLS policies with authenticated-only access

-- Update suppliers table policies
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public write access to suppliers" ON public.suppliers;

CREATE POLICY "Authenticated users can read suppliers" 
ON public.suppliers 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage suppliers" 
ON public.suppliers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Update customers table policies  
DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public write access to customers" ON public.customers;

CREATE POLICY "Authenticated users can read customers" 
ON public.customers 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage customers" 
ON public.customers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Update staff_codes table policies - Admin only for sensitive staff data
DROP POLICY IF EXISTS "Allow public read access to staff codes" ON public.staff_codes;
DROP POLICY IF EXISTS "Allow public write access to staff codes" ON public.staff_codes;

CREATE POLICY "Admins can read staff codes" 
ON public.staff_codes 
FOR SELECT 
TO authenticated 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage staff codes" 
ON public.staff_codes 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) = 'admin') 
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Update production_batches table policies
DROP POLICY IF EXISTS "Allow public read access to production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Allow public write access to production batches" ON public.production_batches;

CREATE POLICY "Authenticated users can read production batches" 
ON public.production_batches 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Production users can manage production batches" 
ON public.production_batches 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) IN ('admin', 'production')) 
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'production'));

-- Update products table policies
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public write access to products" ON public.products;

CREATE POLICY "Authenticated users can read products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Production users can manage products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) IN ('admin', 'production')) 
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'production'));

-- PHASE 2: Fix Database Function Security - Add search_path to security definer functions

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_role(p_profile_id uuid, p_role user_role)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  UPDATE public.profiles 
  SET role = p_role, updated_at = now()
  WHERE id = p_profile_id
  RETURNING *;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profiles()
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, email text, extended_session boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.role,
    p.full_name,
    p.created_at,
    p.updated_at,
    p.created_by,
    u.email,
    p.extended_session
  FROM public.profiles p
  JOIN auth.users u ON p.user_id = u.id
  ORDER BY p.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_profile(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    id,
    user_id,
    role,
    full_name,
    created_at,
    updated_at,
    created_by,
    extended_session
  FROM public.profiles 
  WHERE user_id = p_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_profile(p_profile_id uuid, p_full_name text, p_role user_role, p_extended_session boolean DEFAULT NULL::boolean)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  UPDATE public.profiles 
  SET 
    full_name = p_full_name,
    role = p_role, 
    extended_session = COALESCE(p_extended_session, extended_session),
    updated_at = now()
  WHERE id = p_profile_id
  RETURNING *;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_extended_session(p_profile_id uuid, p_extended_session boolean)
 RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  UPDATE public.profiles 
  SET 
    extended_session = p_extended_session,
    updated_at = now()
  WHERE id = p_profile_id
  RETURNING *;
$function$;

CREATE OR REPLACE FUNCTION public.get_batch_remaining_stock(batch_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  batch_record RECORD;
  dispatched_quantity INTEGER;
  remaining_stock INTEGER;
BEGIN
  -- Get batch info
  SELECT packages_produced, manual_stock_adjustment, COALESCE(manual_stock_adjustment, 0) as adjustment
  INTO batch_record
  FROM public.production_batches
  WHERE id = batch_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Get total dispatched quantity
  SELECT COALESCE(SUM(quantity), 0)
  INTO dispatched_quantity
  FROM public.dispatch_items
  WHERE item_id = batch_id_param::text AND item_type = 'batch';
  
  -- Calculate remaining stock: original production + manual adjustments - dispatched
  remaining_stock := batch_record.packages_produced + COALESCE(batch_record.adjustment, 0) - dispatched_quantity;
  
  RETURN GREATEST(0, remaining_stock);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, created_by)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'::public.user_role
      ELSE 'production'::public.user_role
    END,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE((NEW.raw_user_meta_data ->> 'created_by')::uuid, NEW.id)
  );
  RETURN NEW;
END;
$function$;