
import { ChefHat, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { CleaningTaskHeader } from "./CleaningTaskHeader";
import { CleaningTaskFilters } from "./CleaningTaskFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TabContent } from "./cleaning/TabContent";

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
  const isMobile = useIsMobile();

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
    <div className={cn("space-y-6", isMobile && "pt-16")}>
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
        <TabsList className={cn(
          "grid w-full grid-cols-3",
          isMobile && "h-12"
        )}>
          <TabsTrigger 
            value="chef" 
            className={cn(
              "flex items-center gap-2 touch-manipulation",
              isMobile && "text-xs px-2"
            )}
          >
            <ChefHat className="w-4 h-4" />
            {!isMobile && "Chef Tasks"}
            {isMobile && "Chef"}
            {chefTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {chefTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="cleaner" 
            className={cn(
              "flex items-center gap-2 touch-manipulation",
              isMobile && "text-xs px-2"
            )}
          >
            <Sparkles className="w-4 h-4" />
            {!isMobile && "Cleaner Tasks"}
            {isMobile && "Cleaner"}
            {cleanerTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cleanerTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="other" 
            className={cn(
              "flex items-center gap-2 touch-manipulation",
              isMobile && "text-xs px-2"
            )}
          >
            <Users className="w-4 h-4" />
            {!isMobile && "Other Tasks"}
            {isMobile && "Other"}
            {otherTasks.openTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {otherTasks.openTasks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chef" className="mt-6">
          <TabContent
            openTasks={chefTasks.openTasks}
            completedTasks={chefTasks.completedTasks}
            showCompleted={showCompletedChef}
            setShowCompleted={setShowCompletedChef}
            emptyMessage="No open chef tasks found"
            sectionTitle="Chef Tasks"
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            isTaskOverdue={isTaskOverdue}
          />
        </TabsContent>

        <TabsContent value="cleaner" className="mt-6">
          <TabContent
            openTasks={cleanerTasks.openTasks}
            completedTasks={cleanerTasks.completedTasks}
            showCompleted={showCompletedCleaner}
            setShowCompleted={setShowCompletedCleaner}
            emptyMessage="No open cleaner tasks found"
            sectionTitle="Cleaner Tasks"
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            isTaskOverdue={isTaskOverdue}
          />
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <TabContent
            openTasks={otherTasks.openTasks}
            completedTasks={otherTasks.completedTasks}
            showCompleted={showCompletedOther}
            setShowCompleted={setShowCompletedOther}
            emptyMessage="No open other tasks found"
            sectionTitle="Other Tasks"
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            isTaskOverdue={isTaskOverdue}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
