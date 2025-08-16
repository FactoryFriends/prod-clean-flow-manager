-- Create a function to update user profile information
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_profile_id uuid,
  p_full_name text,
  p_role user_role
)
RETURNS TABLE(id uuid, user_id uuid, role user_role, full_name text, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.profiles 
  SET 
    full_name = p_full_name,
    role = p_role, 
    updated_at = now()
  WHERE id = p_profile_id
  RETURNING *;
$$;