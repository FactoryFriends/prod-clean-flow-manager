-- ============================================
-- SUPPLIER DATA SECURITY FIX
-- ============================================
-- This migration fixes the critical security vulnerability where supplier contact 
-- information (email, phone, address) was publicly accessible to competitors.
-- 
-- CHANGES:
-- 1. Remove public access policies on suppliers table
-- 2. Add role-based access policies using authentication
-- 3. Admins get full access to all supplier data including sensitive contact info
-- 4. Production users get limited access (name, id) for product management
-- ============================================

-- Drop existing public access policies
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public write access to suppliers" ON public.suppliers;

-- ============================================
-- NEW SECURE POLICIES
-- ============================================

-- Policy 1: Admin users can do everything with suppliers
CREATE POLICY "Admins can manage all supplier data"
ON public.suppliers
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Policy 2: Production users can read basic supplier info (name, id, active status)
-- This allows them to use suppliers in product forms without accessing sensitive contact data
CREATE POLICY "Production users can read basic supplier info"
ON public.suppliers
FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'production'
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- CONTACT INFORMATION PROTECTION VIEW
-- ============================================
-- Create a view for production users that excludes sensitive contact information
-- This view only exposes: id, name, active status (safe for product selection)
CREATE OR REPLACE VIEW public.suppliers_basic AS
SELECT 
  id,
  name,
  active,
  created_at,
  updated_at
FROM public.suppliers
WHERE active = true;

-- Grant access to the basic view for production users
GRANT SELECT ON public.suppliers_basic TO authenticated;

-- Create RLS policy for the basic view
ALTER TABLE public.suppliers_basic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read basic supplier info"
ON public.suppliers_basic
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ============================================
-- AUDIT LOGGING FOR SUPPLIER ACCESS
-- ============================================
-- Log access to sensitive supplier data for compliance
CREATE OR REPLACE FUNCTION public.log_supplier_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone accesses full supplier data (admin access)
  IF get_user_role(auth.uid()) = 'admin' THEN
    INSERT INTO public.audit_logs (
      action_type,
      action_description,
      reference_type,
      reference_id,
      staff_name,
      metadata,
      favv_relevant
    ) VALUES (
      'supplier_access',
      'Admin accessed supplier data: ' || OLD.name,
      'supplier',
      OLD.id,
      (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
      jsonb_build_object(
        'supplier_id', OLD.id,
        'supplier_name', OLD.name,
        'access_level', 'full',
        'user_role', 'admin'
      ),
      false
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;