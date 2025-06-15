
import { CheckCircle, Camera } from "lucide-react";
import { format } from "date-fns";

interface CompletedTask {
  id: string;
  title: string;
  completed_at?: string;
  photo_urls?: string[];
  staff_codes?: {
    initials?: string;
  } | null;
}

interface DashboardRecentTasksProps {
  todaysCompletedTasks: CompletedTask[];
}

export function DashboardRecentTasks({ todaysCompletedTasks }: DashboardRecentTasksProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Recent Task Completions
      </h2>
      <div className="space-y-4">
        {todaysCompletedTasks.length > 0 ? (
          todaysCompletedTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  Completed {task.completed_at ? format(new Date(task.completed_at), "HH:mm") : "today"}
                  {task.staff_codes?.initials && ` by ${task.staff_codes.initials}`}
                </p>
              </div>
              {task.photo_urls && task.photo_urls.length > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs">{task.photo_urls.length}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4">No tasks completed today yet</p>
        )}
        <button 
          onClick={() => window.location.hash = '#reports'}
          className="w-full text-sm text-primary hover:text-primary/80 underline text-center py-2"
        >
          View All Completed Tasks →
        </button>
      </div>
    </div>
  );
}
