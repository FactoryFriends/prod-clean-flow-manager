
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { NewCleaningTaskFormFields } from "./NewCleaningTaskFormFields";

interface NewTaskFormData {
  title: string;
  description: string;
  scheduled_date: string;
  due_time: string;
  estimated_duration: number;
  favv_compliance: boolean;
}

interface NewCleaningTaskFormProps {
  currentLocation: "tothai" | "khin";
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewCleaningTaskForm({ currentLocation, onSuccess, onCancel }: NewCleaningTaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewTaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      scheduled_date: new Date().toISOString().split('T')[0],
      due_time: "",
      estimated_duration: 30,
      favv_compliance: false,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: NewTaskFormData) => {
      Logger.info('Creating new task', { component: 'NewCleaningTaskForm', data });
      const { data: result, error } = await supabase
        .from('cleaning_tasks')
        .insert({
          title: data.title,
          description: data.description,
          location: currentLocation,
          scheduled_date: data.scheduled_date,
          due_time: data.due_time || null,
          estimated_duration: data.estimated_duration,
          favv_compliance: data.favv_compliance,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        Logger.error('Error creating task', { error, component: 'NewCleaningTaskForm' });
        throw error;
      }

      Logger.info('Task created successfully', { component: 'NewCleaningTaskForm', data: { taskId: result?.id } });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      toast({
        title: "Task Created",
        description: "New cleaning task has been created successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      Logger.error('Failed to create task', { error, component: 'NewCleaningTaskForm' });
      toast({
        title: "Error",
        description: "Failed to create cleaning task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewTaskFormData) => {
    createTaskMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NewCleaningTaskFormFields control={form.control} />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
