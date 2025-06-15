
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TaskTemplateFormData {
  title: string;
  description: string;
  location: "tothai" | "khin" | "both";
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  weekly_day_of_week?: number;
  monthly_day_of_month?: number;
  quarterly_start_month?: number;
  estimated_duration: number;
  assigned_role: "chef" | "cleaner";
  favv_compliance: boolean;
  requires_photo: boolean;
}

export function useTaskTemplateMutations({ onSuccess, onError, form }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: async (data: TaskTemplateFormData) => {
      // If location is "both", create templates for both locations
      if (data.location === "both") {
        const locations = ["tothai", "khin"] as const;
        const results = [];
        for (const loc of locations) {
          const { data: result, error } = await supabase
            .from('cleaning_task_templates')
            .insert({
              title: data.title,
              description: data.description,
              location: loc,
              frequency: data.frequency,
              weekly_day_of_week: data.weekly_day_of_week || null,
              monthly_day_of_month: data.monthly_day_of_month || null,
              quarterly_start_month: data.quarterly_start_month || null,
              estimated_duration: data.estimated_duration,
              assigned_role: data.assigned_role,
              favv_compliance: data.favv_compliance,
              requires_photo: data.requires_photo,
              active: true,
            })
            .select()
            .single();
          if (error) throw error;
          results.push(result);
        }
        return results;
      } else {
        const { data: result, error } = await supabase
          .from('cleaning_task_templates')
          .insert({
            title: data.title,
            description: data.description,
            location: data.location,
            frequency: data.frequency,
            weekly_day_of_week: data.weekly_day_of_week || null,
            monthly_day_of_month: data.monthly_day_of_month || null,
            quarterly_start_month: data.quarterly_start_month || null,
            estimated_duration: data.estimated_duration,
            assigned_role: data.assigned_role,
            favv_compliance: data.favv_compliance,
            requires_photo: data.requires_photo,
            active: true,
          })
          .select()
          .single();
        if (error) throw error;
        return [result];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Created",
        description: "New task template has been created successfully.",
      });
      form?.reset?.();
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create task template. Please try again.",
        variant: "destructive",
      });
      onError && onError(error);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: TaskTemplateFormData }) => {
      // For edits, only update a single location (default to 'tothai' if both)
      const locationValue = data.location === "both" ? "tothai" : data.location;
      const { data: result, error } = await supabase
        .from('cleaning_task_templates')
        .update({
          title: data.title,
          description: data.description,
          location: locationValue,
          frequency: data.frequency,
          weekly_day_of_week: data.weekly_day_of_week || null,
          monthly_day_of_month: data.monthly_day_of_month || null,
          quarterly_start_month: data.quarterly_start_month || null,
          estimated_duration: data.estimated_duration,
          assigned_role: data.assigned_role,
          favv_compliance: data.favv_compliance,
          requires_photo: data.requires_photo,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Updated",
        description: "Task template has been updated successfully.",
      });
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error('Failed to update template:', error);
      toast({
        title: "Error",
        description: "Failed to update task template. Please try again.",
        variant: "destructive",
      });
      onError && onError(error);
    },
  });

  return {
    createTemplate,
    updateTemplate
  };
}

