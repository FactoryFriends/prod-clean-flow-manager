
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface TaskPhotoModalProps {
  open: boolean;
  onClose: () => void;
  photoUrls: string[];
  taskTitle: string;
}

export function TaskPhotoModal({
  open,
  onClose,
  photoUrls,
  taskTitle
}: TaskPhotoModalProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {taskTitle} - Completion Photos
            <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {photoUrls.map((url, i) => (
            <div key={i} className="aspect-square rounded bg-gray-100 overflow-hidden">
              <img
                src={url}
                alt={`Completion Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
