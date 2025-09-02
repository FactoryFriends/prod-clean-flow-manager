import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuditTrail } from "@/components/settings/AuditTrail";

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditTrailModal({ isOpen, onClose }: AuditTrailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>FAVV Audit Trail</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <AuditTrail />
        </div>
      </DialogContent>
    </Dialog>
  );
}