
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Calendar, User, Package, Clock } from "lucide-react";
import { format } from "date-fns";

interface BatchDetails {
  id: string;
  name: string;
  batchNumber?: string;
  availableQuantity?: number;
  expiryDate?: string;
  productionDate?: string;
  chef?: string;
  location?: string;
  unitSize?: number;
  unitType?: string;
  productionNotes?: string;
}

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: BatchDetails | null;
}

export function BatchDetailsDialog({
  open,
  onOpenChange,
  batch,
}: BatchDetailsDialogProps) {
  if (!batch) return null;

  const isExpired = batch.expiryDate ? new Date(batch.expiryDate) <= new Date() : false;
  const isExpiringSoon = batch.expiryDate ? 
    new Date(batch.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : false;

  const getExpiryStatus = () => {
    if (isExpired) return { label: "Expired", variant: "destructive" as const };
    if (isExpiringSoon) return { label: "Expiring Soon", variant: "warning" as const };
    return { label: "Fresh", variant: "default" as const };
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Batch Details</span>
            <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{batch.name}</h3>
            {batch.batchNumber && (
              <p className="text-sm text-muted-foreground font-mono">{batch.batchNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {batch.chef && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Made by: {batch.chef}</span>
              </div>
            )}
            
            {batch.availableQuantity !== undefined && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Available: {batch.availableQuantity} packages</span>
              </div>
            )}

            {batch.productionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Produced: {format(new Date(batch.productionDate), "MMM dd, yyyy")}
                </span>
              </div>
            )}

            {batch.expiryDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Expires: {format(new Date(batch.expiryDate), "MMM dd, yyyy")}
                </span>
              </div>
            )}

            {batch.unitSize && batch.unitType && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Package size: {batch.unitSize} {batch.unitType} per package
                </span>
              </div>
            )}
          </div>

          {batch.productionNotes && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Production Notes:</h4>
              <p className="text-sm text-muted-foreground">{batch.productionNotes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
