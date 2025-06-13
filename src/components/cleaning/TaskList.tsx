
import { Brush } from "lucide-react";
import { CleaningTaskCard } from "../CleaningTaskCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: any[];
  emptyMessage: string;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isTaskOverdue: (task: any) => boolean;
}

export function TaskList({ tasks, emptyMessage, onCompleteTask, onReopenTask, isTaskOverdue }: TaskListProps) {
  const isMobile = useIsMobile();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Brush className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
    )}>
      {tasks.map((task) => (
        <CleaningTaskCard
          key={task.id}
          task={task}
          onCompleteTask={(taskId, photoUrls) => onCompleteTask(taskId, photoUrls)}
          onReopenTask={onReopenTask}
          isOverdue={isTaskOverdue(task)}
        />
      ))}
    </div>
  );
}
