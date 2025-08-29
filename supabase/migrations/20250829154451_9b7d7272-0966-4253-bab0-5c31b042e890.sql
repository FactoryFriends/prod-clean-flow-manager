-- Add extended_session field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN extended_session boolean NOT NULL DEFAULT false;

-- Drop existing functions that need signature changes
DROP FUNCTION IF EXISTS public.get_user_profiles();
DROP FUNCTION IF EXISTS public.get_current_user_profile(uuid);
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, user_role);

-- Recreate get_user_profiles function with extended_session
CREATE OR REPLACE FUNCTION public.get_user_profiles()
RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, email text, extended_session boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Recreate get_current_user_profile function with extended_session
CREATE OR REPLACE FUNCTION public.get_current_user_profile(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Recreate update_user_profile function with extended_session
CREATE OR REPLACE FUNCTION public.update_user_profile(p_profile_id uuid, p_full_name text, p_role user_role, p_extended_session boolean DEFAULT null)
RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Create function to update extended_session separately
CREATE OR REPLACE FUNCTION public.update_user_extended_session(p_profile_id uuid, p_extended_session boolean)
RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, extended_session boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  UPDATE public.profiles 
  SET 
    extended_session = p_extended_session,
    updated_at = now()
  WHERE id = p_profile_id
  RETURNING *;
$function$;