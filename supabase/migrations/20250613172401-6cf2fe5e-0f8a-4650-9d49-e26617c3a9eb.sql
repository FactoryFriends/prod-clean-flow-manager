
-- Add departments and permission levels to staff codes
ALTER TABLE public.staff_codes 
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS permission_level text CHECK (permission_level IN ('basic', 'supervisor', 'manager'));

-- Create audit trail table for FAVV compliance tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type text NOT NULL, -- 'production', 'cleaning', 'dispatch', 'quality_check', etc.
  action_description text NOT NULL,
  staff_code text,
  staff_name text,
  location text CHECK (location IN ('tothai', 'khin', 'both')),
  reference_id uuid, -- ID of the related record (batch_id, task_id, etc.)
  reference_type text, -- 'batch', 'cleaning_task', 'dispatch', etc.
  metadata jsonb, -- Additional data like quantities, temperatures, etc.
  favv_relevant boolean NOT NULL DEFAULT false, -- Mark if this is relevant for FAVV compliance
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_favv_relevant ON public.audit_logs (favv_relevant, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_staff_code ON public.audit_logs (staff_code, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs (action_type, timestamp DESC);

-- Enable RLS on audit logs (read-only for most users)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all authenticated users to read audit logs
-- In a real system, you might want to restrict this to managers only
CREATE POLICY "Allow read access to audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy that allows system to insert audit logs
CREATE POLICY "Allow system to insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
