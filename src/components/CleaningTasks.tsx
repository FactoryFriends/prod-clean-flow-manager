import { useState, useEffect } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHelp } from "@/components/help/HelpProvider";
import { cn } from "@/lib/utils";
import { OverdueAlert } from "./cleaning/OverdueAlert";
import { TaskScheduleCard } from "./cleaning/TaskScheduleCard";
import { RoleFilter } from "./cleaning/RoleFilter";
import { TasksList } from "./cleaning/TasksList";
// import { TaskPhotoModal } from "./task/TaskPhotoModal"; // Removed
import { format } from "date-fns";
import { CleaningTasksFilters } from "./CleaningTasksFilters";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  // State for date navigation (now supports range)
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<"tothai" | "khin">("tothai");
  const [filterRole, setFilterRole] = useState<"all" | "chef" | "cleaner">("all");
  const [showOverdueTasks, setShowOverdueTasks] = useState(false);
  const isMobile = useIsMobile();
  const { setCurrentSection } = useHelp();

  // Details modal for completed tasks (shows both details and photos)
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

  // Handle clicking on any completed task with photos (show details + photos)
  const handleCompletedTaskClick = (task: any) => {
    if (task.status === "closed" && task.photo_urls && task.photo_urls.length) {
      setSelectedTask(task);
      setDetailsModalOpen(true);
    }
  };

  // Helper to reset to today for both date fields
  const handleToday = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setShowOverdueTasks(false);
  };

  // Filter logic now: by period
  const filteredTasks = cleaningTasks.filter(task => {
    if (showOverdueTasks) {
      const matchesRole = filterRole === "all" || task.assigned_role === filterRole;
      const isOpen = task.status === 'open';
      const isOverdue = isTaskOverdue(task);
      return matchesRole && isOpen && isOverdue;
    } else {
      // Range: show tasks within startDate ~ endDate
      const taskDate = new Date(task.scheduled_date.split('T')[0]);
      if (!startDate || !endDate) return false;
      const inRange =
        taskDate >= new Date(startDate.toDateString()) &&
        taskDate <= new Date(endDate.toDateString());
      const matchesRole = filterRole === "all" || task.assigned_role === filterRole;
      const isOpen = task.status === 'open' || task.status === 'closed';
      return inRange && matchesRole && isOpen;
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
      {/* Location select stays the same */}
      <div className="flex gap-2 mb-2">
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
      </div>

      {/* Moved the filter here, under the location */}
      <CleaningTasksFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onToday={handleToday}
      />

      <OverdueAlert
        overdueCount={overdueCount}
        locationName={selectedLocation === 'tothai' ? 'ToThai' : 'KHIN'}
        onClick={handleOverdueAlertClick}
      />

      <RoleFilter
        filterRole={filterRole}
        onRoleChange={setFilterRole}
      />

      <TasksList
        selectedDate={showOverdueTasks ? "overdue" : ""}
        filteredTasks={filteredTasks}
        onCompleteTask={handleCompleteTask}
        onReopenTask={handleReopenTask}
        isTaskOverdue={isTaskOverdue}
        showOverdueTasks={showOverdueTasks}
        onBackToSchedule={() => setShowOverdueTasks(false)}
        onCompletedTaskClick={handleCompletedTaskClick}
      />

      {/* Modal: Show details + photo gallery below if any */}
      {selectedTask && (
        <CleaningTaskDetailsModal
          task={selectedTask}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
