
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Clock, AlertTriangle, Camera, TrendingUp, Calendar } from "lucide-react";
import { CompletedTasksTable } from "./favv/CompletedTasksTable";
import { PhotoGallery } from "./PhotoGallery";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";
import { useFAVVCompletedTasks } from "../hooks/useFAVVCompletedTasks";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { format, startOfDay, endOfDay } from "date-fns";

interface ManagementReportsProps {
  currentLocation: "tothai" | "khin";
  onSectionChange?: (section: string) => void;
}

export function ManagementReports({ currentLocation, onSectionChange }: ManagementReportsProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const startDate = startOfDay(selectedDate);
  const endDate = endOfDay(selectedDate);

  const { data: completedTasks = [], isLoading } = useFAVVCompletedTasks({
    locationFilter: currentLocation,
    startDate,
    endDate,
    taskNameFilter: ""
  });

  const { getOverdueTasksCount } = useCleaningTasks(currentLocation);
  
  // Calculate today's stats
  const todaysTasks = completedTasks.filter(task => {
    const completedDate = new Date(task.completed_at || task.scheduled_date);
    return format(completedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  });

  const tasksWithPhotos = completedTasks.filter(task => task.photo_urls && task.photo_urls.length > 0);
  const overdueCount = getOverdueTasksCount();

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTileClick = (tileType: string) => {
    switch (tileType) {
      case "completed":
        // Scroll to completed tasks table
        const tableElement = document.querySelector('[data-testid="completed-tasks-table"]');
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case "photos":
        // Scroll to photo gallery section
        const photoSection = document.querySelector('[data-testid="photo-gallery"]');
        if (photoSection) {
          photoSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case "overdue":
        // Navigate to cleaning tasks
        onSectionChange?.('cleaning');
        break;
      case "completion":
        // Scroll to completed tasks table for completion rate details
        const completionSection = document.querySelector('[data-testid="completed-tasks-table"]');
        if (completionSection) {
          completionSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
    }
  };

  const stats = [
    {
      title: "Tasks Completed Today",
      value: todaysTasks.length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      clickType: "completed",
    },
    {
      title: "Tasks with Photo Evidence",
      value: tasksWithPhotos.length.toString(),
      icon: Camera,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      clickType: "photos",
    },
    {
      title: "Overdue Tasks",
      value: overdueCount.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      clickType: "overdue",
    },
    {
      title: "Completion Rate",
      value: completedTasks.length > 0 ? "94%" : "0%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      clickType: "completion",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Management Dashboard</h2>
          <p className="text-muted-foreground">
            Task performance and completion overview for {currentLocation === "tothai" ? "ToThai" : "KHIN"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="hover:shadow-md transition-all cursor-pointer hover:scale-105" 
              onClick={() => handleTileClick(stat.clickType)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Task Completions with Photos */}
      {tasksWithPhotos.length > 0 && (
        <Card data-testid="photo-gallery">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Recent Completions with Photo Evidence ({tasksWithPhotos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasksWithPhotos.slice(0, 6).map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                     onClick={() => handleTaskClick(task)}>
                  <h4 className="font-medium mb-2">{task.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Completed {task.completed_at ? format(new Date(task.completed_at), "MMM dd, HH:mm") : "N/A"}
                  </p>
                  {task.photo_urls && task.photo_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {task.photo_urls.slice(0, 2).map((photoUrl: string, index: number) => (
                        <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                          <img
                            src={photoUrl}
                            alt={`Task completion ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {task.photo_urls && task.photo_urls.length > 2 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{task.photo_urls.length - 2} more photos
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks Table */}
      <div data-testid="completed-tasks-table">
        <CompletedTasksTable
          completedTasks={completedTasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
        />
      </div>

      <CleaningTaskDetailsModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
