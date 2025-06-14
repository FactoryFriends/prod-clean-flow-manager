import { ChefHat, Sparkles, Users, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CleaningTaskCard } from "./CleaningTaskCard";
import { format } from "date-fns";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState<"tothai" | "khin">("tothai");
  const [filterRole, setFilterRole] = useState<"all" | "chef" | "cleaner">("all");
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
      {/* Overdue Tasks Alert */}
      {overdueCount > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Overdue Tasks Alert</h3>
                <p className="text-red-700">{overdueCount} tasks overdue at {selectedLocation === 'tothai' ? 'ToThai' : 'KHIN'} Restaurant.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Schedule Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Task Schedule</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedLocation === 'tothai' ? 'default' : 'outline'}
                onClick={() => setSelectedLocation('tothai')}
                className={cn(
                  "px-4 py-2",
                  selectedLocation === 'tothai' 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                ToThai Restaurant
              </Button>
              <Button
                variant={selectedLocation === 'khin' ? 'default' : 'outline'}
                onClick={() => setSelectedLocation('khin')}
                className={cn(
                  "px-4 py-2",
                  selectedLocation === 'khin' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                KHIN Restaurant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter by Role */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filter by Role:</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterRole === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRole('all')}
            className={cn(
              "px-4 py-2",
              filterRole === 'all' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            All Tasks
          </Button>
          <Button
            variant={filterRole === 'chef' ? 'default' : 'outline'}
            onClick={() => setFilterRole('chef')}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              filterRole === 'chef' 
                ? "bg-orange-500 hover:bg-orange-600 text-white" 
                : "border-orange-300 text-orange-700 hover:bg-orange-50"
            )}
          >
            <ChefHat className="w-4 h-4" />
            Chef Tasks
          </Button>
          <Button
            variant={filterRole === 'cleaner' ? 'default' : 'outline'}
            onClick={() => setFilterRole('cleaner')}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              filterRole === 'cleaner' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-green-300 text-green-700 hover:bg-green-50"
            )}
          >
            <Users className="w-4 h-4" />
            Staff Tasks
          </Button>
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          TASKS FOR {format(new Date(selectedDate), 'yyyy-MM-dd').toUpperCase()}
        </h2>

        {filteredTasks.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No tasks found for the selected date and filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <CleaningTaskCard
                key={task.id}
                task={task}
                onCompleteTask={handleCompleteTask}
                onReopenTask={handleReopenTask}
                isOverdue={isTaskOverdue(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
