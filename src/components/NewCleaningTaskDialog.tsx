
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { NewCleaningTaskForm } from "./cleaning/NewCleaningTaskForm";

interface NewCleaningTaskDialogProps {
  currentLocation: "tothai" | "khin";
}

export function NewCleaningTaskDialog({ currentLocation }: NewCleaningTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          New Cleaning Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Cleaning Task</DialogTitle>
        </DialogHeader>
        <NewCleaningTaskForm 
          currentLocation={currentLocation}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
