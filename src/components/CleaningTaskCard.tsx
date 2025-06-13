
import { Brush, Clock, CheckCircle, AlertTriangle, RotateCcw, Camera } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface CleaningTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  due_time: string | null;
  status: "open" | "closed";
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
  assigned_role: "chef" | "cleaner" | "other" | null;
  requires_photo: boolean | null;
}

interface CleaningTaskCardProps {
  task: CleaningTask;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
  isOverdue: boolean;
}

export function CleaningTaskCard({ task, onCompleteTask, onReopenTask, isOverdue }: CleaningTaskCardProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
    if (task.assigned_staff_name) {
      return task.assigned_staff_name;
    }
    
    if (task.assigned_role) {
      switch (task.assigned_role) {
        case 'chef': return 'CHEF';
        case 'cleaner': return 'CLEANING STAFF';
        case 'other': return 'OTHER STAFF';
        default: return 'UNASSIGNED';
      }
    }
    
    return 'UNASSIGNED';
  };

  // Check if task is severely overdue (72+ hours)
  const isSeverelyOverdue = () => {
    if (task.status === 'closed') return false;
    
    const scheduledDate = new Date(task.scheduled_date);
    const now = new Date();
    const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 72;
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedPhotos(files);
  };

  const handleCompleteTask = async () => {
    if (task.requires_photo && selectedPhotos.length === 0) {
      alert("This task requires a photo before completion.");
      return;
    }

    if (task.requires_photo && selectedPhotos.length > 0) {
      setUploadingPhotos(true);
      try {
        // Here you would upload photos to Supabase Storage
        // For now, we'll simulate with file names
        const photoUrls = selectedPhotos.map(file => file.name);
        onCompleteTask(task.id, photoUrls);
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert("Error uploading photos. Please try again.");
      } finally {
        setUploadingPhotos(false);
      }
    } else {
      onCompleteTask(task.id);
    }
  };

  const severelyOverdue = isSeverelyOverdue();

  return (
    <div className={`bg-card border rounded-lg p-6 hover:shadow-md transition-shadow ${
      severelyOverdue ? 'border-red-500 bg-red-50 shadow-red-100' : 
      isOverdue ? 'border-red-300 bg-red-50' : 'border-border'
    }`}>
      {severelyOverdue && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-800">CRITICAL: 72+ HOURS OVERDUE</span>
          </div>
          <p className="text-sm text-red-700 mt-1">This task requires immediate attention!</p>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            severelyOverdue ? 'bg-red-200' : isOverdue ? 'bg-red-200' : 'bg-accent'
          }`}>
            {severelyOverdue || isOverdue ? (
              <AlertTriangle className={`w-5 h-5 ${severelyOverdue ? 'text-red-700' : 'text-red-600'}`} />
            ) : (
              <Brush className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.scheduled_date} {task.due_time && `at ${task.due_time}`}
            </p>
            {severelyOverdue && (
              <p className="text-sm text-red-700 font-bold">CRITICAL OVERDUE - Immediate Action Required!</p>
            )}
            {isOverdue && !severelyOverdue && (
              <p className="text-sm text-red-600 font-medium">OVERDUE - Action Required!</p>
            )}
          </div>
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
                {getAssignedToDisplay()}
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

          {task.requires_photo && (
            <div className="text-sm">
              <div className="flex items-center gap-2 text-orange-600">
                <Camera className="w-4 h-4" />
                <span className="font-medium">Photo required for completion</span>
              </div>
            </div>
          )}
        </div>

        {/* Photo upload for open tasks that require photos */}
        {task.status === "open" && task.requires_photo && (
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload completion photo:
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/80"
            />
            {selectedPhotos.length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                {selectedPhotos.length} photo(s) selected
              </p>
            )}
          </div>
        )}

        {/* Display existing photos for completed tasks */}
        {task.photo_urls && task.photo_urls.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2">Completion photos:</p>
            <div className="text-sm text-muted-foreground">
              {task.photo_urls.length} photo(s) uploaded
            </div>
          </div>
        )}

        {/* Tags moved to bottom */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          {task.assigned_role && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {task.assigned_role.toUpperCase()}
            </Badge>
          )}
          {task.favv_compliance && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              FAVV
            </Badge>
          )}
          <StatusBadge status={task.status} size="sm" />
        </div>

        <div className="flex gap-2 pt-2">
          {task.status === "open" && (
            <Button
              onClick={handleCompleteTask}
              disabled={uploadingPhotos}
              className={`flex items-center gap-2 ${
                severelyOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              size="sm"
            >
              <CheckCircle className="w-4 h-4" />
              {uploadingPhotos ? 'Uploading...' : severelyOverdue ? 'Complete Now' : 'Complete'}
            </Button>
          )}
          
          {task.status === "closed" && (
            <Button
              onClick={() => onReopenTask(task.id)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
