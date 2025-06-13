
import { Brush, Clock, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";
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

interface CleaningTaskCardProps {
  task: CleaningTask;
  onCompleteTask: (taskId: string) => void;
  onReopenTask: (taskId: string) => void;
  isOverdue: boolean;
}

export function CleaningTaskCard({ task, onCompleteTask, onReopenTask, isOverdue }: CleaningTaskCardProps) {
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'chef': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cleaner': return 'bg-green-50 text-green-700 border-green-200';
      case 'other': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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
          <div className={`p-2 rounded-lg ${
            severelyOverdue ? 'bg-red-200' : isOverdue ? 'bg-red-200' : 'bg-accent'
          }`}>
            {severelyOverdue || isOverdue ? (
              <AlertTriangle className={`w-5 h-5 ${severelyOverdue ? 'text-red-700' : 'text-red-600'}`} />
            ) : (
              <Brush className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.scheduled_date} {task.due_time && `at ${task.due_time}`}
            </p>
            {severelyOverdue && (
              <p className="text-sm text-red-700 font-bold">CRITICAL OVERDUE - Immediate Action Required!</p>
            )}
            {isOverdue && !severelyOverdue && (
              <p className="text-sm text-red-600 font-medium">OVERDUE - Action Required!</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {task.assigned_role && (
            <Badge variant="outline" className={getRoleBadgeColor(task.assigned_role)}>
              {task.assigned_role.toUpperCase()}
            </Badge>
          )}
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
          {task.status === "open" && (
            <Button
              onClick={() => onCompleteTask(task.id)}
              className={`flex items-center gap-2 ${
                severelyOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              size="sm"
            >
              <CheckCircle className="w-4 h-4" />
              {severelyOverdue ? 'Complete Now' : 'Complete'}
            </Button>
          )}
          
          {task.status === "closed" && (
            <Button
              onClick={() => onReopenTask(task.id)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
