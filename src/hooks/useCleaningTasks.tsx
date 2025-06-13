
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
  requires_photo: boolean | null;
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
        .select(`
          *,
          cleaning_task_templates!template_id(requires_photo)
        `)
        .eq('location', dbLocation)
        .order('scheduled_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning tasks:', error);
        throw error;
      }

      console.log('Fetched cleaning tasks:', data);
      
      // Transform the data to flatten the requires_photo field
      const transformedData = data.map(task => ({
        ...task,
        requires_photo: task.cleaning_task_templates?.requires_photo || false
      }));

      return transformedData as CleaningTask[];
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, completedBy, photoUrls }: { 
      taskId: string; 
      status: "open" | "closed"; 
      completedBy?: string;
      photoUrls?: string[];
    }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'closed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = completedBy;
        if (photoUrls && photoUrls.length > 0) {
          updateData.photo_urls = photoUrls;
        }
      } else {
        // If reopening, clear completion data
        updateData.completed_at = null;
        updateData.completed_by = null;
        updateData.photo_urls = null;
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

  const handleCompleteTask = (taskId: string, photoUrls?: string[]) => {
    const userCode = prompt("Enter your 4-digit staff code:");
    if (userCode && userCode.length === 4) {
      updateTaskMutation.mutate({ 
        taskId, 
        status: 'closed', 
        completedBy: userCode,
        photoUrls
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

  // Check if task is severely overdue (>72 hours)
  const isTaskSeverelyOverdue = (task: CleaningTask) => {
    if (task.status === 'closed') return false;
    
    const scheduledDate = new Date(task.scheduled_date);
    const now = new Date();
    const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 72;
  };

  // Group tasks by role
  const getTasksByRole = (role: "chef" | "cleaner" | "other") => {
    return cleaningTasks.filter(task => task.assigned_role === role);
  };

  // Get overdue tasks count for dashboard alerts
  const getOverdueTasksCount = () => {
    return cleaningTasks.filter(task => isTaskOverdue(task)).length;
  };

  // Get severely overdue tasks count (72+ hours)
  const getSeverelyOverdueTasksCount = () => {
    return cleaningTasks.filter(task => isTaskSeverelyOverdue(task)).length;
  };

  return {
    cleaningTasks,
    isLoading,
    error,
    updateTaskMutation,
    handleCompleteTask,
    handleReopenTask,
    isTaskOverdue,
    isTaskSeverelyOverdue,
    getTasksByRole,
    getOverdueTasksCount,
    getSeverelyOverdueTasksCount
  };
}
