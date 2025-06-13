
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { PhotoUpload } from "../PhotoUpload";
import { PhotoGallery } from "../PhotoGallery";
import { useState } from "react";

interface TaskActionsProps {
  taskId: string;
  status: "open" | "closed";
  requiresPhoto: boolean | null;
  photoUrls: string[] | null;
  severelyOverdue: boolean;
  onCompleteTask: (taskId: string, photoUrls?: string[]) => void;
  onReopenTask: (taskId: string) => void;
}

export function TaskActions({ 
  taskId, 
  status, 
  requiresPhoto, 
  photoUrls, 
  severelyOverdue, 
  onCompleteTask, 
  onReopenTask 
}: TaskActionsProps) {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handlePhotosUploaded = (photoUrls: string[]) => {
    onCompleteTask(taskId, photoUrls);
    setShowPhotoUpload(false);
  };

  const handleCompleteClick = () => {
    if (requiresPhoto) {
      setShowPhotoUpload(true);
    } else {
      onCompleteTask(taskId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo upload section for open tasks that require photos */}
      {status === "open" && showPhotoUpload && (
        <div className="border-t border-border pt-4">
          <PhotoUpload
            onPhotosUploaded={handlePhotosUploaded}
            maxPhotos={3}
            required={requiresPhoto || false}
          />
          <Button
            variant="outline"
            onClick={() => setShowPhotoUpload(false)}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Display existing photos for completed tasks */}
      {photoUrls && photoUrls.length > 0 && (
        <div className="border-t border-border pt-4">
          <PhotoGallery photos={photoUrls} />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {status === "open" && (
          <Button
            onClick={handleCompleteClick}
            className={`flex items-center gap-2 ${
              severelyOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
            size="sm"
          >
            <CheckCircle className="w-4 h-4" />
            {severelyOverdue ? 'Complete Now' : 'Complete'}
          </Button>
        )}
        
        {status === "closed" && (
          <Button
            onClick={() => onReopenTask(taskId)}
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
  );
}
