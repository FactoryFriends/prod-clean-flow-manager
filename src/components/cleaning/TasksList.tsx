
import { Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  showOverdueTasks?: boolean;
  onBackToSchedule?: () => void;
}

export function TasksList({ 
  selectedDate, 
  filteredTasks, 
  onCompleteTask, 
  onReopenTask, 
  isTaskOverdue,
  showOverdueTasks = false,
  onBackToSchedule
}: TasksListProps) {
  const getHeaderTitle = () => {
    if (showOverdueTasks) {
      return "OVERDUE TASKS";
    }
    return `TASKS FOR ${format(new Date(selectedDate), 'yyyy-MM-dd').toUpperCase()}`;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {showOverdueTasks && onBackToSchedule && (
          <Button
            variant="outline"
            onClick={onBackToSchedule}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule
          </Button>
        )}
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {getHeaderTitle()}
        </h2>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {showOverdueTasks 
                ? "No overdue tasks found."
                : "No tasks found for the selected date and filters."
              }
            </p>
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
