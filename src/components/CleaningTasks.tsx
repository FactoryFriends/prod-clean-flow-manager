import { Brush } from "lucide-react";
import { useState } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { CleaningTaskHeader } from "./CleaningTaskHeader";
import { CleaningTaskFilters } from "./CleaningTaskFilters";
import { CleaningTaskCard } from "./CleaningTaskCard";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showOnlyFAVV, setShowOnlyFAVV] = useState(false);

  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  const locationName = currentLocation === "location1" ? "ToThai Production Facility" : "KHIN Restaurant";

  const {
    cleaningTasks,
    isLoading,
    error,
    handleCompleteTask,
    handleStartTask
  } = useCleaningTasks(dbLocation);

  // Filter tasks based on search term, status, and FAVV compliance
  const filteredTasks = cleaningTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesFAVV = !showOnlyFAVV || task.favv_compliance;
    
    return matchesSearch && matchesStatus && matchesFAVV;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Cleaning Tasks</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading cleaning tasks. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CleaningTaskHeader 
        locationName={locationName}
        currentLocation={dbLocation}
      />

      <CleaningTaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        showOnlyFAVV={showOnlyFAVV}
        setShowOnlyFAVV={setShowOnlyFAVV}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <CleaningTaskCard
            key={task.id}
            task={task}
            onStartTask={handleStartTask}
            onCompleteTask={handleCompleteTask}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Brush className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No cleaning tasks found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== "all" || showOnlyFAVV 
              ? "Try adjusting your filters or search terms" 
              : "No cleaning tasks scheduled for this location"}
          </p>
        </div>
      )}
    </div>
  );
}
