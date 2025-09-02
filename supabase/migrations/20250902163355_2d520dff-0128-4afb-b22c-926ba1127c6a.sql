-- Fix critical security vulnerability: Restrict audit logs access to admin users only
-- The audit_logs table was publicly readable, exposing sensitive operational data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public write access to audit logs" ON public.audit_logs;

-- Create secure RLS policies for audit_logs table
-- Policy 1: Only admin users can read audit logs
CREATE POLICY "Admin users can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 2: Allow system and authenticated users to insert audit logs (for logging purposes)
CREATE POLICY "Authenticated users can create audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy 3: Only admin users can update audit logs
CREATE POLICY "Admin users can update audit logs" 
ON public.audit_logs 
FOR UPDATE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policy 4: Only admin users can delete audit logs
CREATE POLICY "Admin users can delete audit logs" 
ON public.audit_logs 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add audit log entry for this security fix
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
  'Fixed critical security vulnerability: Restricted audit logs access to admin users only to prevent competitor monitoring', 
  'SYSTEM', 
  'System Security', 
  'tothai', 
  'security_fix', 
  '{"vulnerability": "public_audit_logs_access", "fix": "admin_only_access", "impact": "operational_data_protected", "severity": "critical", "risk": "competitor_monitoring_prevented"}', 
  true
);