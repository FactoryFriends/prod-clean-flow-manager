
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { TaskList } from "./TaskList";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CompletedTasksSectionProps {
  completedTasks: any[];
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  sectionTitle: string;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isTaskOverdue: (task: any) => boolean;
}

export function CompletedTasksSection({
  completedTasks,
  showCompleted,
  setShowCompleted,
  sectionTitle,
  onCompleteTask,
  onReopenTask,
  isTaskOverdue
}: CompletedTasksSectionProps) {
  const isMobile = useIsMobile();

  if (completedTasks.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <Button
        variant="ghost"
        onClick={() => setShowCompleted(!showCompleted)}
        className={cn(
          "w-full flex items-center justify-between p-4 hover:bg-accent rounded-lg touch-manipulation",
          isMobile && "min-h-[48px]"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">
            Completed {sectionTitle} ({completedTasks.length})
          </span>
        </div>
        {showCompleted ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
      
      {showCompleted && (
        <div className="mt-4">
          <TaskList
            tasks={completedTasks}
            emptyMessage=""
            onCompleteTask={onCompleteTask}
            onReopenTask={onReopenTask}
            isTaskOverdue={isTaskOverdue}
          />
        </div>
      )}
    </div>
  );
}
