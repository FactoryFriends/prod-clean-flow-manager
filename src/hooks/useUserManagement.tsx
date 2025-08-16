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

export interface UpdateUserRequest {
  id: string;
  full_name: string;
  role: 'admin' | 'production';
}

export const useUserProfiles = () => {
  return useQuery({
    queryKey: ["user-profiles"],
    queryFn: async () => {
      try {
        // Use the get_user_profiles function that exists in the database
        const { data, error } = await supabase
          .rpc('get_user_profiles' as any);
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          // If the function doesn't exist or there's a permission error, return empty array
          if (error.code === 'PGRST116' || error.message?.includes('function') || error.message?.includes('permission')) {
            console.warn('User profiles function not available or no permission');
            return [];
          }
          throw error;
        }
        
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('Error in useUserProfiles:', error);
        // Return empty array on any error to prevent UI crashes
        return [];
      }
    },
    // Add some default options to help with loading states
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once on failure
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        console.log('Fetching profile for user:', user.id); // Debug log

        // Fetch user profile from database using the RPC function
        const { data, error } = await supabase
          .rpc('get_current_user_profile' as any, { p_user_id: user.id });
        
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }

        console.log('Profile data from database:', data); // Debug log

        // The RPC function returns an array, get the first result
        const profile = data && data.length > 0 ? data[0] : null;
        console.log('Final profile:', profile); // Debug log
        
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
    mutationFn: async ({ profileId, full_name, role }: { profileId: string; full_name: string; role: 'admin' | 'production' }) => {
      const { data, error } = await supabase
        .rpc('update_user_profile' as any, { 
          p_profile_id: profileId,
          p_full_name: full_name,
          p_role: role 
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