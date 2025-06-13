
import { Brush, Users, ChefHat, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { CleaningTaskHeader } from "./CleaningTaskHeader";
import { CleaningTaskFilters } from "./CleaningTaskFilters";
import { CleaningTaskCard } from "./CleaningTaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showOnlyFAVV, setShowOnlyFAVV] = useState(false);
  const [showCompletedChef, setShowCompletedChef] = useState(false);
  const [showCompletedCleaner, setShowCompletedCleaner] = useState(false);
  const [showCompletedOther, setShowCompletedOther] = useState(false);

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

  // Separate open and completed tasks
  const getTasksByRoleAndStatus = (role: "chef" | "cleaner" | "other") => {
    const allTasks = filterTasks(getTasksByRole(role));
    const openTasks = allTasks.filter(task => task.status === 'open');
    const completedTasks = allTasks.filter(task => task.status === 'closed');
    return { openTasks, completedTasks };
  };

  const chefTasks = getTasksByRoleAndStatus('chef');
  const cleanerTasks = getTasksByRoleAndStatus('cleaner');
  const otherTasks = getTasksByRoleAndStatus('other');
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

  const renderCompletedTasksSection = (
    completedTasks: any[], 
    showCompleted: boolean, 
    setShowCompleted: (show: boolean) => void,
    sectionTitle: string
  ) => {
    if (completedTasks.length === 0) return null;

    return (
      <div className="mt-8 border-t border-border pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between p-4 hover:bg-accent rounded-lg"
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
            {renderTaskList(completedTasks, "")}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = (
    openTasks: any[], 
    completedTasks: any[], 
    showCompleted: boolean, 
    setShowCompleted: (show: boolean) => void,
    emptyMessage: string,
    sectionTitle: string
  ) => {
    return (
      <div>
        {/* Open Tasks Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Open {sectionTitle}
            {openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {openTasks.length}
              </Badge>
            )}
          </h3>
          {renderTaskList(openTasks, emptyMessage)}
        </div>

        {/* Completed Tasks Section */}
        {renderCompletedTasksSection(completedTasks, showCompleted, setShowCompleted, sectionTitle)}
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
            {chefTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {chefTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cleaner" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Cleaner Tasks
            {cleanerTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cleanerTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Other Tasks
            {otherTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {otherTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chef" className="mt-6">
          {renderTabContent(
            chefTasks.openTasks,
            chefTasks.completedTasks,
            showCompletedChef,
            setShowCompletedChef,
            "No open chef tasks found",
            "Chef Tasks"
          )}
        </TabsContent>

        <TabsContent value="cleaner" className="mt-6">
          {renderTabContent(
            cleanerTasks.openTasks,
            cleanerTasks.completedTasks,
            showCompletedCleaner,
            setShowCompletedCleaner,
            "No open cleaner tasks found",
            "Cleaner Tasks"
          )}
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          {renderTabContent(
            otherTasks.openTasks,
            otherTasks.completedTasks,
            showCompletedOther,
            setShowCompletedOther,
            "No open other tasks found",
            "Other Tasks"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
