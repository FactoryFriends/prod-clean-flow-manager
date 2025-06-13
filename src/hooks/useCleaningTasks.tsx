
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CleaningTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  due_time: string | null;
  status: "open" | "closed";
  assigned_to: string | null;
  assigned_staff_name: string | null;
  completed_at: string | null;
  completed_by: string | null;
  completion_notes: string | null;
  photo_urls: string[] | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  favv_compliance: boolean | null;
  template_id: string | null;
  assigned_role: "chef" | "cleaner" | "other" | null;
}

export function useCleaningTasks(dbLocation: "tothai" | "khin") {
  const queryClient = useQueryClient();

  // Fetch cleaning tasks
  const { data: cleaningTasks = [], isLoading, error } = useQuery({
    queryKey: ['cleaning-tasks', dbLocation],
    queryFn: async () => {
      console.log('Fetching cleaning tasks for location:', dbLocation);
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('location', dbLocation)
        .order('scheduled_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning tasks:', error);
        throw error;
      }

      console.log('Fetched cleaning tasks:', data);
      return data as CleaningTask[];
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, completedBy }: { taskId: string; status: "open" | "closed"; completedBy?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'closed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = completedBy;
      } else {
        // If reopening, clear completion data
        updateData.completed_at = null;
        updateData.completed_by = null;
      }

      const { data, error } = await supabase
        .from('cleaning_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
    },
  });

  const handleCompleteTask = (taskId: string) => {
    const userCode = prompt("Enter your 4-digit staff code:");
    if (userCode && userCode.length === 4) {
      updateTaskMutation.mutate({ 
        taskId, 
        status: 'closed', 
        completedBy: userCode 
      });
    } else {
      alert("Please enter a valid 4-digit staff code");
    }
  };

  const handleReopenTask = (taskId: string) => {
    updateTaskMutation.mutate({ 
      taskId, 
      status: 'open'
    });
  };

  // Check if task is overdue (>48 hours)
  const isTaskOverdue = (task: CleaningTask) => {
    if (task.status === 'closed') return false;
    
    const scheduledDate = new Date(task.scheduled_date);
    const now = new Date();
    const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours > 48;
  };

  // Group tasks by role
  const getTasksByRole = (role: "chef" | "cleaner" | "other") => {
    return cleaningTasks.filter(task => task.assigned_role === role);
  };

  // Get overdue tasks count for dashboard alerts
  const getOverdueTasksCount = () => {
    return cleaningTasks.filter(task => isTaskOverdue(task)).length;
  };

  return {
    cleaningTasks,
    isLoading,
    error,
    updateTaskMutation,
    handleCompleteTask,
    handleReopenTask,
    isTaskOverdue,
    getTasksByRole,
    getOverdueTasksCount
  };
}
