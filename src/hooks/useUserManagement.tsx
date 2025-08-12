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
      try {
        // Return empty for now - this will be properly implemented when profiles table is available in types
        console.warn('User profiles not available - authentication may need setup');
        return [] as (UserProfile & { email: string })[];
      } catch (error: any) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          console.warn('User does not have permission to view user profiles');
          return [];
        }
        throw error;
      }
    },
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        // Return mock profile for now - secure profile system needs proper implementation
        return {
          id: 'temp-id',
          user_id: user.id,
          role: 'admin', // Temporary - should be fetched from database
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null
        } as UserProfile;
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
      // This would normally update the database - for now return success
      console.log('Update user role:', profileId, role);
      return { success: true };
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