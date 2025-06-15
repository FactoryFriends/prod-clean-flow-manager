
import { useState, useEffect } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHelp } from "@/components/help/HelpProvider";
import { cn } from "@/lib/utils";
import { OverdueAlert } from "./cleaning/OverdueAlert";
import { TaskScheduleCard } from "./cleaning/TaskScheduleCard";
import { RoleFilter } from "./cleaning/RoleFilter";
import { TasksList } from "./cleaning/TasksList";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState<"tothai" | "khin">("tothai");
  const [filterRole, setFilterRole] = useState<"all" | "chef" | "cleaner">("all");
  const isMobile = useIsMobile();
  
  // Set help context
  const { setCurrentSection } = useHelp();
  
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

  // Filter tasks by selected date and role
  const filteredTasks = cleaningTasks.filter(task => {
    const taskDate = task.scheduled_date.split('T')[0];
    const matchesDate = taskDate === selectedDate;
    const matchesRole = filterRole === "all" || task.assigned_role === filterRole;
    const isOpen = task.status === 'open';
    return matchesDate && matchesRole && isOpen;
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
      <OverdueAlert 
        overdueCount={overdueCount} 
        locationName={selectedLocation === 'tothai' ? 'ToThai' : 'KHIN'} 
      />

      <TaskScheduleCard
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <RoleFilter
        filterRole={filterRole}
        onRoleChange={setFilterRole}
      />

      <TasksList
        selectedDate={selectedDate}
        filteredTasks={filteredTasks}
        onCompleteTask={handleCompleteTask}
        onReopenTask={handleReopenTask}
        isTaskOverdue={isTaskOverdue}
      />
    </div>
  );
}
