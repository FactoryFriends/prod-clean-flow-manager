
import { Brush, Clock, CheckCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CleaningTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  due_time: string | null;
  status: "pending" | "in-progress" | "completed" | "overdue";
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
}

interface CleaningTaskCardProps {
  task: CleaningTask;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export function CleaningTaskCard({ task, onStartTask, onCompleteTask }: CleaningTaskCardProps) {
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Brush className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.scheduled_date} {task.due_time && `at ${task.due_time}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {task.favv_compliance && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              FAVV
            </Badge>
          )}
          <StatusBadge status={task.status} size="sm" />
        </div>
      </div>
      
      <div className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground font-medium">
              {formatDuration(task.estimated_duration)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Assigned To</p>
              <p className="text-foreground font-medium">
                {task.assigned_staff_name || task.assigned_to || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="text-foreground font-medium capitalize">{task.status}</p>
            </div>
          </div>

          {task.completed_at && (
            <div className="text-sm">
              <p className="text-muted-foreground">Completed by {task.completed_by} on {new Date(task.completed_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          {task.status === "pending" && (
            <Button
              onClick={() => onStartTask(task.id)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Start Task
            </Button>
          )}
          
          {task.status === "in-progress" && (
            <Button
              onClick={() => onCompleteTask(task.id)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </Button>
          )}

          <Button variant="outline" size="sm">
            Edit Task
          </Button>
        </div>
      </div>
    </div>
  );
}
