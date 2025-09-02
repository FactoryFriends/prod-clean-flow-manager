-- Fix security vulnerability: Restrict access to suppliers table
-- Replace overly permissive RLS policies with secure, role-based access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public write access to suppliers" ON public.suppliers;

-- Create secure RLS policies for suppliers table
-- Policy 1: Only authenticated users can view suppliers
CREATE POLICY "Authenticated users can view suppliers" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Policy 2: Only admin users can create suppliers
CREATE POLICY "Admin users can create suppliers" 
ON public.suppliers 
FOR INSERT 
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 3: Only admin users can update suppliers
CREATE POLICY "Admin users can update suppliers" 
ON public.suppliers 
FOR UPDATE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 4: Only admin users can delete suppliers
CREATE POLICY "Admin users can delete suppliers" 
ON public.suppliers 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add audit log entry for security fix
INSERT INTO audit_logs (
  action_type, 
  action_description, 
  staff_code, 
  staff_name, 
  location, 
  reference_type, 
  metadata, 
  favv_relevant
) VALUES (
  'security', 
  'Fixed critical security vulnerability: Restricted supplier contact information access to authenticated users only', 
  'SYSTEM', 
  'System Security', 
  'tothai', 
  'security_fix', 
  '{"vulnerability": "public_supplier_access", "fix": "rls_policies_updated", "impact": "supplier_contact_info_protected", "severity": "critical"}', 
  true
);