import { Brush, Users, ChefHat, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { CleaningTaskHeader } from "./CleaningTaskHeader";
import { CleaningTaskFilters } from "./CleaningTaskFilters";
import { CleaningTaskCard } from "./CleaningTaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

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
    handleReopenTask,
    isTaskOverdue,
    getTasksByRole,
    getOverdueTasksCount
  } = useCleaningTasks(dbLocation);

  // Filter tasks based on search term, status, and FAVV compliance
  const filterTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assigned_staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      const matchesFAVV = !showOnlyFAVV || task.favv_compliance;
      
      return matchesSearch && matchesStatus && matchesFAVV;
    });
  };

  const chefTasks = filterTasks(getTasksByRole('chef'));
  const cleanerTasks = filterTasks(getTasksByRole('cleaner'));
  const otherTasks = filterTasks(getTasksByRole('other'));
  const overdueCount = getOverdueTasksCount();

  const renderTaskList = (tasks: any[], emptyMessage: string) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-8">
          <Brush className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <CleaningTaskCard
            key={task.id}
            task={task}
            onCompleteTask={(taskId, photoUrls) => handleCompleteTask(taskId, photoUrls)}
            onReopenTask={handleReopenTask}
            isOverdue={isTaskOverdue(task)}
          />
        ))}
      </div>
    );
  };

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
        overdueCount={overdueCount}
      />

      <CleaningTaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        showOnlyFAVV={showOnlyFAVV}
        setShowOnlyFAVV={setShowOnlyFAVV}
      />

      <Tabs defaultValue="chef" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chef" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Chef Tasks
            {chefTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {chefTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cleaner" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Cleaner Tasks
            {cleanerTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cleanerTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Other Tasks
            {otherTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {otherTasks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chef" className="mt-6">
          {renderTaskList(chefTasks, "No chef tasks found")}
        </TabsContent>

        <TabsContent value="cleaner" className="mt-6">
          {renderTaskList(cleanerTasks, "No cleaner tasks found")}
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          {renderTaskList(otherTasks, "No other tasks found")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
