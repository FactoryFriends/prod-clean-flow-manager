
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseFAVVCompletedTasksProps {
  locationFilter: "all" | "tothai" | "khin";
  startDate?: Date;
  endDate?: Date;
  taskNameFilter: string;
}

export function useFAVVCompletedTasks({ 
  locationFilter, 
  startDate, 
  endDate, 
  taskNameFilter 
}: UseFAVVCompletedTasksProps) {
  return useQuery({
    queryKey: ["favv-completed-tasks", locationFilter, startDate, endDate, taskNameFilter],
    queryFn: async () => {
      let query = supabase
        .from("cleaning_tasks")
        .select("*")
        .eq("status", "closed")
        .order("completed_at", { ascending: false });

      if (locationFilter && locationFilter !== "all") {
        query = query.eq("location", locationFilter);
      }

      if (startDate) {
        query = query.gte("completed_at", startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("completed_at", endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by task name on client side
      const filteredTasks = data.filter(task => 
        !taskNameFilter || task.title.toLowerCase().includes(taskNameFilter.toLowerCase())
      );

      // Fetch staff codes separately and map them to tasks
      const uniqueStaffCodes = [...new Set(filteredTasks.map(task => task.completed_by).filter(Boolean))];
      
      if (uniqueStaffCodes.length > 0) {
        const { data: staffCodes, error: staffError } = await supabase
          .from("staff_codes")
          .select("code, initials")
          .in("code", uniqueStaffCodes);

        if (!staffError && staffCodes) {
          const staffCodeMap = new Map(staffCodes.map(sc => [sc.code, sc.initials]) || []);

          return filteredTasks.map(task => ({
            ...task,
            staff_codes: task.completed_by ? { initials: staffCodeMap.get(task.completed_by) || task.completed_by } : null
          }));
        }
      }

      return filteredTasks.map(task => ({
        ...task,
        staff_codes: null
      }));
    },
  });
}
