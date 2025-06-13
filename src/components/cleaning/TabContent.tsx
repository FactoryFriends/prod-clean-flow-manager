
import { Badge } from "../ui/badge";
import { TaskList } from "./TaskList";
import { CompletedTasksSection } from "./CompletedTasksSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TabContentProps {
  openTasks: any[];
  completedTasks: any[];
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  emptyMessage: string;
  sectionTitle: string;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isTaskOverdue: (task: any) => boolean;
}

export function TabContent({
  openTasks,
  completedTasks,
  showCompleted,
  setShowCompleted,
  emptyMessage,
  sectionTitle,
  onCompleteTask,
  onReopenTask,
  isTaskOverdue
}: TabContentProps) {
  const isMobile = useIsMobile();

  const activeSectionTitle = sectionTitle === "Other Tasks" ? "ACTIVE TASKS" : 
                            sectionTitle === "Chef Tasks" ? "ACTIVE CHEF TASKS" :
                            sectionTitle === "Cleaner Tasks" ? "ACTIVE CLEANER TASKS" :
                            `Open ${sectionTitle}`;

  return (
    <div>
      {/* Open Tasks Section */}
      <div className="mb-4">
        <h3 className={cn(
          "font-semibold text-foreground mb-4 flex items-center gap-2",
          isMobile ? "text-base" : "text-lg"
        )}>
          {activeSectionTitle}
          {openTasks.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {openTasks.length}
            </Badge>
          )}
        </h3>
        <TaskList
          tasks={openTasks}
          emptyMessage={emptyMessage}
          onCompleteTask={onCompleteTask}
          onReopenTask={onReopenTask}
          isTaskOverdue={isTaskOverdue}
        />
      </div>

      {/* Completed Tasks Section */}
      <CompletedTasksSection
        completedTasks={completedTasks}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        sectionTitle={sectionTitle}
        onCompleteTask={onCompleteTask}
        onReopenTask={onReopenTask}
        isTaskOverdue={isTaskOverdue}
      />
    </div>
  );
}
