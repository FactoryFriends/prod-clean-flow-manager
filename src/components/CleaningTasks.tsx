import { useState, useEffect } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHelp } from "@/components/help/HelpProvider";
import { cn } from "@/lib/utils";
import { OverdueAlert } from "./cleaning/OverdueAlert";
import { TaskScheduleCard } from "./cleaning/TaskScheduleCard";
import { RoleFilter } from "./cleaning/RoleFilter";
import { TasksList } from "./cleaning/TasksList";
import { TaskPhotoModal } from "./task/TaskPhotoModal";
import { format } from "date-fns";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  // State for date navigation
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState<"tothai" | "khin">("tothai");
  const [filterRole, setFilterRole] = useState<"all" | "chef" | "cleaner">("all");
  const [showOverdueTasks, setShowOverdueTasks] = useState(false);
  const isMobile = useIsMobile();
  const { setCurrentSection } = useHelp();

  // Photo modal
  const [photoModalTask, setPhotoModalTask] = useState<{ photoUrls: string[], title: string } | null>(null);

  useEffect(() => {
    setCurrentSection("cleaning");
  }, [setCurrentSection]);

  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  const locationName = currentLocation === "location1" ? "ToThai Production Facility" : "KHIN Restaurant";

  const {
    cleaningTasks,
    isLoading,
    error,
    handleCompleteTask,
    handleReopenTask,
    isTaskOverdue,
    getOverdueTasksCount
  } = useCleaningTasks(selectedLocation);

  const overdueCount = getOverdueTasksCount();

  // Handle overdue alert click
  const handleOverdueAlertClick = () => {
    setShowOverdueTasks(true);
    setFilterRole("all"); // Show all roles when viewing overdue tasks
  };

  // Handle clicking on any completed task with photos
  const handleCompletedTaskClick = (task: any) => {
    if (task.status === "closed" && task.photo_urls && task.photo_urls.length) {
      setPhotoModalTask({ photoUrls: task.photo_urls, title: task.title });
    }
  };

  // Filter tasks by selected date and role, or show overdue tasks
  const filteredTasks = cleaningTasks.filter(task => {
    if (showOverdueTasks) {
      // Show overdue tasks regardless of date
      const matchesRole = filterRole === "all" || task.assigned_role === filterRole;
      const isOpen = task.status === 'open';
      const isOverdue = isTaskOverdue(task);
      return matchesRole && isOpen && isOverdue;
    } else {
      // Show tasks for selected date
      const taskDate = task.scheduled_date.split('T')[0];
      const matchesDate = taskDate === selectedDate;
      const matchesRole = filterRole === "all" || task.assigned_role === filterRole;
      const isOpen = task.status === 'open' || task.status === 'closed';
      return matchesDate && matchesRole && isOpen;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-foreground">Cleaning Tasks</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading cleaning tasks. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6", isMobile && "pt-16")}>
      {/* Always-visible date picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Browse cleaning tasks for date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
            max={format(new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")}
            min="2020-01-01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Location:
          </label>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value as "tothai" | "khin")}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="tothai">ToThai</option>
            <option value="khin">KHIN</option>
          </select>
        </div>
        <div>
          <button
            className="mt-6 sm:mt-4 ml-0 sm:ml-4 underline text-blue-600 text-sm"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </button>
        </div>
      </div>

      <OverdueAlert
        overdueCount={overdueCount}
        locationName={selectedLocation === 'tothai' ? 'ToThai' : 'KHIN'}
        onClick={handleOverdueAlertClick}
      />

      <RoleFilter
        filterRole={filterRole}
        onRoleChange={setFilterRole}
      />

      {/* Pass a click handler for completed tasks */}
      <TasksList
        selectedDate={showOverdueTasks ? "overdue" : selectedDate}
        filteredTasks={filteredTasks}
        onCompleteTask={handleCompleteTask}
        onReopenTask={handleReopenTask}
        isTaskOverdue={isTaskOverdue}
        showOverdueTasks={showOverdueTasks}
        onBackToSchedule={() => setShowOverdueTasks(false)}
        onCompletedTaskClick={handleCompletedTaskClick}
      />

      {/* Task Photo Modal */}
      {photoModalTask && (
        <TaskPhotoModal
          open={!!photoModalTask}
          onClose={() => setPhotoModalTask(null)}
          photoUrls={photoModalTask.photoUrls}
          taskTitle={photoModalTask.title}
        />
      )}
    </div>
  );
}
