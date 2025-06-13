
import { Broom, Plus, Search, Filter, Clock, CheckCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface CleaningTasksProps {
  currentLocation: string;
}

export function CleaningTasks({ currentLocation }: CleaningTasksProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const cleaningTasks = [
    {
      id: "CT-001",
      title: "Deep Clean Production Line 1",
      area: "Production Floor",
      priority: "high",
      status: "in-progress" as const,
      assignedTo: "Cleaning Team A",
      scheduledDate: "2024-06-13",
      estimatedDuration: "4 hours",
      description: "Complete deep cleaning including equipment sanitization",
    },
    {
      id: "CT-002", 
      title: "Restroom Maintenance",
      area: "Facilities",
      priority: "medium",
      status: "completed" as const,
      assignedTo: "Maintenance Staff",
      scheduledDate: "2024-06-12",
      estimatedDuration: "2 hours",
      description: "Daily restroom cleaning and supply restocking",
    },
    {
      id: "CT-003",
      title: "Warehouse Floor Cleaning",
      area: "Warehouse",
      priority: "low",
      status: "pending" as const,
      assignedTo: "Cleaning Team B",
      scheduledDate: "2024-06-14",
      estimatedDuration: "3 hours",
      description: "Sweep and mop warehouse floors, organize storage areas",
    },
    {
      id: "CT-004",
      title: "Equipment Sanitization",
      area: "Quality Control",
      priority: "high",
      status: "overdue" as const,
      assignedTo: "QC Team",
      scheduledDate: "2024-06-11",
      estimatedDuration: "2 hours",
      description: "Sanitize all quality control equipment and testing stations",
    },
  ];

  const filteredTasks = cleaningTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cleaning Tasks</h1>
          <p className="text-muted-foreground">
            Manage cleaning and maintenance tasks at {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-fit">
          <Plus className="w-4 h-4" />
          New Cleaning Task
        </button>
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
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Broom className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{task.id}</h3>
                  <p className="text-sm text-muted-foreground">{task.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(task.priority)} bg-accent`}>
                  {task.priority.toUpperCase()}
                </span>
                <StatusBadge status={task.status} size="sm" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground font-medium">{task.estimatedDuration}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="text-foreground font-medium">{task.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Scheduled</p>
                    <p className="text-foreground font-medium">{task.scheduledDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                {task.status !== "completed" && (
                  <button className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-sm">
                  Edit Task
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
