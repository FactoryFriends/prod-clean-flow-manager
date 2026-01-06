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
  extended_session: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'production';
  extended_session: boolean;
}

export interface UpdateUserRequest {
  id: string;
  full_name: string;
  role: 'admin' | 'production';
  extended_session: boolean;
}

export const useUserProfiles = () => {
  return useQuery({
    queryKey: ["user-profiles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_profiles' as any);
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          if (error.code === 'PGRST116' || error.message?.includes('function') || error.message?.includes('permission')) {
            console.warn('User profiles function not available or no permission');
            return [];
          }
          throw error;
        }
        
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('Error in useUserProfiles:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data, error } = await supabase
          .rpc('get_current_user_profile' as any, { p_user_id: user.id });
        
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }

        const profile = data && data.length > 0 ? data[0] : null;
        return profile;
      } catch (error) {
        console.error('Error fetching current user profile:', error);
        return null;
      }
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          role: userData.role,
          extended_session: userData.extended_session,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
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
      const { data, error } = await supabase
        .rpc('update_user_role' as any, { 
          p_profile_id: profileId, 
          p_role: role 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, full_name, role, extended_session }: { profileId: string; full_name: string; role: 'admin' | 'production'; extended_session: boolean }) => {
      const { data, error } = await supabase
        .rpc('update_user_profile' as any, { 
          p_profile_id: profileId,
          p_full_name: full_name,
          p_role: role,
          p_extended_session: extended_session
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
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

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, email, newPassword }: { userId?: string; email: string; newPassword?: string }) => {
      if (newPassword && userId) {
        // Admin setting a specific password via edge function
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'update-password',
            userId,
            password: newPassword,
          },
        });
        
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return { ...data, resetLink: null };
      } else {
        // Send reset email (this still works with anon key)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        
        const resetLink = `${window.location.origin}/reset-password`;
        return { success: true, resetLink, email };
      }
    },
    onSuccess: (data, { newPassword }) => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      if (newPassword) {
        toast.success("Password updated successfully");
      } else {
        toast.success("Password reset email sent successfully");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to reset password: ${error.message}`);
    },
  });
};

export const useGenerateResetLink = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      
      return { 
        email, 
        resetLink: `${window.location.origin}/reset-password`,
        message: "Reset email sent to user. They will receive an email with a secure reset link."
      };
    },
    onSuccess: (data) => {
      toast.success(`Reset link generated for ${data.email}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to generate reset link: ${error.message}`);
    },
  });
};
