
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AuditLog {
  id: string;
  action_type: string;
  action_description: string;
  staff_code: string | null;
  staff_name: string | null;
  location: string | null;
  reference_id: string | null;
  reference_type: string | null;
  metadata: any;
  favv_relevant: boolean;
  timestamp: string;
  created_at: string;
}

export interface CreateAuditLogData {
  action_type: string;
  action_description: string;
  staff_code?: string;
  staff_name?: string;
  location?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: any;
  favv_relevant?: boolean;
}

export const useAuditLogs = (favvOnly: boolean = false) => {
  return useQuery({
    queryKey: ["audit-logs", favvOnly],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (favvOnly) {
        query = query.eq("favv_relevant", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAuditLogData) => {
      const { error } = await supabase
        .from("audit_logs")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
    onError: (error: any) => {
      console.error("Failed to create audit log:", error);
      // Don't show toast for audit log failures to avoid disrupting user experience
    },
  });
};

// Helper function to log actions
export const logAuditAction = async (data: CreateAuditLogData) => {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert(data);

    if (error) {
      console.error("Failed to log audit action:", error);
    }
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
};
