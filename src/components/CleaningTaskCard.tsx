import { AlertTriangle } from "lucide-react";
import { TaskIcon } from "./task/TaskIcon";
import { TaskHeader } from "./task/TaskHeader";
import { TaskDetails } from "./task/TaskDetails";
import { TaskTags } from "./task/TaskTags";
import { TaskActions } from "./task/TaskActions";

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

interface CleaningTaskCardProps {
  task: CleaningTask;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isOverdue: boolean;
}

export function CleaningTaskCard({ task, onCompleteTask, onReopenTask, isOverdue }: CleaningTaskCardProps) {
  // Check if task is severely overdue (72+ hours)
  const isSeverelyOverdue = () => {
    if (task.status === 'closed') return false;
    
    const scheduledDate = new Date(task.scheduled_date);
    const now = new Date();
    const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 72;
  };

  const severelyOverdue = isSeverelyOverdue();

  return (
    <div className={`bg-card border rounded-lg p-6 hover:shadow-md transition-shadow ${
      severelyOverdue ? 'border-red-500 bg-red-50 shadow-red-100' : 
      isOverdue ? 'border-red-300 bg-red-50' : 'border-border'
    }`}>
      {severelyOverdue && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-800">CRITICAL: 72+ HOURS OVERDUE</span>
          </div>
          <p className="text-sm text-red-700 mt-1">This task requires immediate attention!</p>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <TaskIcon isOverdue={isOverdue} severelyOverdue={severelyOverdue} />
          <TaskHeader 
            title={task.title}
            scheduledDate={task.scheduled_date}
            dueTime={task.due_time}
            severelyOverdue={severelyOverdue}
            isOverdue={isOverdue}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <TaskDetails
          description={task.description}
          estimatedDuration={task.estimated_duration}
          assignedStaffName={task.assigned_staff_name}
          assignedRole={task.assigned_role}
          status={task.status}
          completedAt={task.completed_at}
          completedBy={task.completed_by}
          requiresPhoto={task.requires_photo}
        />

        <TaskTags
          assignedRole={task.assigned_role}
          favvCompliance={task.favv_compliance}
          status={task.status}
        />

        <TaskActions
          taskId={task.id}
          status={task.status}
          requiresPhoto={task.requires_photo}
          photoUrls={task.photo_urls}
          severelyOverdue={severelyOverdue}
          onCompleteTask={onCompleteTask}
          onReopenTask={onReopenTask}
        />
      </div>
    </div>
  );
}
