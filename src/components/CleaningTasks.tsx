import { Brush, Plus, Search, Filter, Clock, CheckCircle, Camera, AlertTriangle, Calendar } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FAVVReport } from "./FAVVReport";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CleaningTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  due_time: string | null;
  status: "pending" | "in-progress" | "completed" | "overdue";
  assigned_to: string | null;
  assigned_staff_name: string | null;
  completed_at: string | null;
  completed_by: string | null;
  completion_notes: string | null;
  photo_urls: string[] | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  favv_compliance: boolean | null;
  template_id: string | null;
}

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showOnlyFAVV, setShowOnlyFAVV] = useState(false);
  const queryClient = useQueryClient();

  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  const locationName = currentLocation === "location1" ? "ToThai Production Facility" : "KHIN Restaurant";

  // Fetch cleaning tasks
  const { data: cleaningTasks = [], isLoading, error } = useQuery({
    queryKey: ['cleaning-tasks', dbLocation],
    queryFn: async () => {
      console.log('Fetching cleaning tasks for location:', dbLocation);
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('location', dbLocation)
        .order('scheduled_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning tasks:', error);
        throw error;
      }

      console.log('Fetched cleaning tasks:', data);
      return data as CleaningTask[];
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, completedBy }: { taskId: string; status: string; completedBy?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = completedBy;
      }

      const { data, error } = await supabase
        .from('cleaning_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
    },
  });

  // Filter tasks based on search term, status, and FAVV compliance
  const filteredTasks = cleaningTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesFAVV = !showOnlyFAVV || task.favv_compliance;
    
    return matchesSearch && matchesStatus && matchesFAVV;
  });

  const getPriorityColor = (task: CleaningTask) => {
    if (task.status === "overdue") return "text-red-600";
    if (task.favv_compliance) return "text-orange-600";
    return "text-green-600";
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const handleCompleteTask = (taskId: string) => {
    const userCode = prompt("Enter your 4-digit staff code:");
    if (userCode && userCode.length === 4) {
      updateTaskMutation.mutate({ 
        taskId, 
        status: 'completed', 
        completedBy: userCode 
      });
    } else {
      alert("Please enter a valid 4-digit staff code");
    }
  };

  const handleStartTask = (taskId: string) => {
    const userCode = prompt("Enter your 4-digit staff code to start this task:");
    if (userCode && userCode.length === 4) {
      updateTaskMutation.mutate({ 
        taskId, 
        status: 'in-progress'
      });
    } else {
      alert("Please enter a valid 4-digit staff code");
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cleaning Tasks</h1>
          <p className="text-muted-foreground">
            Manage cleaning and maintenance tasks at {locationName}
          </p>
        </div>
        <div className="flex gap-2">
          <FAVVReport currentLocation={currentLocation} />
          <Button className="flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" />
            New Cleaning Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search cleaning tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <Button
            variant={showOnlyFAVV ? "default" : "outline"}
            onClick={() => setShowOnlyFAVV(!showOnlyFAVV)}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            FAVV Only
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Brush className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.scheduled_date} {task.due_time && `at ${task.due_time}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {task.favv_compliance && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    FAVV
                  </Badge>
                )}
                <StatusBadge status={task.status} size="sm" />
              </div>
            </div>
            
            <div className="space-y-4">
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground font-medium">
                    {formatDuration(task.estimated_duration)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="text-foreground font-medium">
                      {task.assigned_staff_name || task.assigned_to || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="text-foreground font-medium capitalize">{task.status}</p>
                  </div>
                </div>

                {task.completed_at && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Completed by {task.completed_by} on {new Date(task.completed_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                {task.status === "pending" && (
                  <Button
                    onClick={() => handleStartTask(task.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    Start Task
                  </Button>
                )}
                
                {task.status === "in-progress" && (
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </Button>
                )}

                <Button variant="outline" size="sm">
                  Edit Task
                </Button>
              </div>
            </div>
          </div>
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
