import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'production';
  full_name: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'production';
}

export const useUserProfiles = () => {
  return useQuery({
    queryKey: ["user-profiles"],
    queryFn: async () => {
      // Using raw SQL query since profiles table might not be in types yet
      const { data, error } = await supabase
        .rpc('get_user_profiles');
      
      if (error) throw error;
      return data as (UserProfile & { user: { email: string } })[];
    },
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Using raw SQL query since profiles table might not be in types yet
      const { data, error } = await supabase
        .rpc('get_current_user_profile', { p_user_id: user.id });
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!supabase.auth.getUser(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      // This would normally require an edge function to create users with specific roles
      // For now, we'll show how the UI would work
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, role }: { profileId: string; role: 'admin' | 'production' }) => {
      // Using raw SQL query since profiles table might not be in types yet
      const { data, error } = await supabase
        .rpc('update_user_role', { p_profile_id: profileId, p_role: role });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};