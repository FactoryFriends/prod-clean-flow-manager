
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { CalendarIcon, Clock, User, CheckSquare, Camera } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CleaningTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  completed_at: string | null;
  assigned_role: "chef" | "cleaner" | "other" | null;
  favv_compliance: boolean | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  completion_notes: string | null;
  staff_codes?: {
    initials: string;
  } | null;
}

interface CleaningTaskDetailsModalProps {
  task: CleaningTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CleaningTaskDetailsModal({ task, isOpen, onClose }: CleaningTaskDetailsModalProps) {
  if (!task) return null;

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "chef": return "bg-orange-100 text-orange-800";
      case "cleaner": return "bg-green-100 text-green-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location and Status */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {task.location.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              COMPLETED
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Scheduled Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(task.scheduled_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Completed Date</p>
                  <p className="text-sm text-muted-foreground">
                    {task.completed_at 
                      ? format(new Date(task.completed_at), "MMM dd, yyyy HH:mm")
                      : "N/A"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Completed By</p>
                  <p className="text-sm text-muted-foreground">
                    {task.staff_codes?.initials || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Assigned Role</p>
                <Badge className={cn("text-xs", getRoleBadgeColor(task.assigned_role))}>
                  {task.assigned_role?.toUpperCase() || "N/A"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">FAVV Compliance</p>
                <Badge className={cn(
                  "text-xs",
                  task.favv_compliance 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                )}>
                  {task.favv_compliance ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {task.actual_duration 
                      ? `${formatDuration(task.actual_duration)} (actual)`
                      : task.estimated_duration
                      ? `~${formatDuration(task.estimated_duration)} (estimated)`
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Notes */}
          {task.completion_notes && (
            <div>
              <h4 className="font-medium mb-2">Completion Notes</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                {task.completion_notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
