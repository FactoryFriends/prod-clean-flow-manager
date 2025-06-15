import React from "react";
import { Button } from "../ui/button";
import { CleaningTaskCard } from "../CleaningTaskCard";

interface TasksListProps {
  selectedDate: string;
  filteredTasks: any[];
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isTaskOverdue: (task: any) => boolean;
  showOverdueTasks: boolean;
  onBackToSchedule: () => void;
  onCompletedTaskClick?: (task: any) => void;
}

export function TasksList({
  selectedDate,
  filteredTasks,
  onCompleteTask,
  onReopenTask,
  isTaskOverdue,
  showOverdueTasks,
  onBackToSchedule,
  onCompletedTaskClick,
}: TasksListProps) {
  return (
    <div className="space-y-6">
      {showOverdueTasks && (
        <div>
          <button
            className="text-blue-600 underline text-sm mb-2"
            onClick={onBackToSchedule}
          >
            ← Back to schedule view
          </button>
        </div>
      )}
      {filteredTasks.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground bg-muted/30">
          No cleaning tasks found for selected criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`
                ${task.status === 'closed' ? 'bg-green-50 border-green-300' : 'bg-card border-border'}
                border rounded-lg p-4 transition-shadow hover:shadow
                cursor-pointer
              `}
              onClick={() => {
                if (task.status === "closed" && task.photo_urls && task.photo_urls.length && onCompletedTaskClick) {
                  onCompletedTaskClick(task);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-base">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    Scheduled for {task.scheduled_date}
                  </p>
                  <span className={`inline-block text-xs px-2 py-1 rounded 
                    ${task.status === 'closed' ? 'bg-green-100 text-green-700'
                       : isTaskOverdue(task) ? 'bg-red-100 text-red-700'
                       : 'bg-muted text-muted-foreground'}
                  `}>
                    {task.status === 'closed'
                      ? 'Completed'
                      : isTaskOverdue(task)
                        ? 'Overdue'
                        : 'Open'}
                  </span>
                  {task.status === "closed" && task.photo_urls && task.photo_urls.length > 0 && (
                    <span className="ml-2 inline-flex text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {task.photo_urls.length} Photo{task.photo_urls.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div>
                  {task.status === 'open' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                    >
                      Complete Task
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReopenTask(task.id);
                      }}
                    >
                      Reopen Task
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
