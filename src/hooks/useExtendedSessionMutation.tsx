import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUpdateExtendedSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, extended_session }: { profileId: string; extended_session: boolean }) => {
      const { data, error } = await supabase
        .rpc('update_user_extended_session' as any, { 
          p_profile_id: profileId, 
          p_extended_session: extended_session 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      toast.success("Session duration updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update session duration: ${error.message}`);
    },
  });
};