
import { Clock, Camera } from "lucide-react";

interface TaskDetailsProps {
  description: string | null;
  estimatedDuration: number | null;
  assignedStaffName: string | null;
  assignedRole: "chef" | "cleaner" | "other" | null;
  status: "open" | "closed";
  completedAt: string | null;
  completedBy: string | null;
  requiresPhoto: boolean | null;
}

export function TaskDetails({ 
  description, 
  estimatedDuration, 
  assignedStaffName, 
  assignedRole, 
  status, 
  completedAt, 
  completedBy, 
  requiresPhoto 
}: TaskDetailsProps) {
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getAssignedToDisplay = () => {
    if (assignedStaffName) {
      return assignedStaffName;
    }
    
    if (assignedRole) {
      switch (assignedRole) {
        case 'chef': return 'CHEF';
        case 'cleaner': return 'CLEANING STAFF';
        case 'other': return 'OTHER STAFF';
        default: return 'UNASSIGNED';
      }
    }
    
    return 'UNASSIGNED';
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Duration:</span>
          <span className="text-foreground font-medium">
            {formatDuration(estimatedDuration)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Assigned To</p>
            <p className="text-foreground font-medium">
              {getAssignedToDisplay()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="text-foreground font-medium capitalize">{status}</p>
          </div>
        </div>

        {completedAt && (
          <div className="text-sm">
            <p className="text-muted-foreground">Completed by {completedBy} on {new Date(completedAt).toLocaleDateString()}</p>
          </div>
        )}

        {requiresPhoto && (
          <div className="text-sm">
            <div className="flex items-center gap-2 text-orange-600">
              <Camera className="w-4 h-4" />
              <span className="font-medium">Photo required for completion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
