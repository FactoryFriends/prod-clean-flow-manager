-- Fix security vulnerability: Restrict access to suppliers table
-- Replace overly permissive RLS policies with secure, role-based access

-- Drop all existing policies for suppliers table
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public write access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin users can create suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin users can delete suppliers" ON public.suppliers;

-- Create secure RLS policies for suppliers table
-- Policy 1: Only authenticated users can view suppliers (secure replacement for public access)
CREATE POLICY "suppliers_authenticated_select" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Policy 2: Only admin users can create suppliers
CREATE POLICY "suppliers_admin_insert" 
ON public.suppliers 
FOR INSERT 
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 3: Only admin users can update suppliers
CREATE POLICY "suppliers_admin_update" 
ON public.suppliers 
FOR UPDATE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 4: Only admin users can delete suppliers
CREATE POLICY "suppliers_admin_delete" 
ON public.suppliers 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add audit log entry for security fix (using valid location)
INSERT INTO audit_logs (
  action_type, 
  action_description, 
  staff_code, 
  staff_name, 
  reference_type, 
  metadata, 
  favv_relevant
) VALUES (
  'security', 
  'CRITICAL: Fixed supplier data breach vulnerability - restricted public access to supplier contact information', 
  'SYSTEM', 
  'System Security', 
  'security_vulnerability_fix', 
  '{"vulnerability": "public_supplier_contact_access", "severity": "critical", "fix_applied": "rls_authentication_required", "data_protected": ["email", "phone", "contact_person", "address"]}', 
  true
);