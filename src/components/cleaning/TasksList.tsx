
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CleaningTaskCard } from "@/components/CleaningTaskCard";
import { format } from "date-fns";

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
  assigned_role: "chef" | "cleaner" | null;
  requires_photo: boolean | null;
}

interface TasksListProps {
  selectedDate: string;
  filteredTasks: CleaningTask[];
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isTaskOverdue: (task: CleaningTask) => boolean;
}

export function TasksList({ 
  selectedDate, 
  filteredTasks, 
  onCompleteTask, 
  onReopenTask, 
  isTaskOverdue 
}: TasksListProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        TASKS FOR {format(new Date(selectedDate), 'yyyy-MM-dd').toUpperCase()}
      </h2>

      {filteredTasks.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No tasks found for the selected date and filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <CleaningTaskCard
              key={task.id}
              task={task}
              onCompleteTask={onCompleteTask}
              onReopenTask={onReopenTask}
              isOverdue={isTaskOverdue(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
