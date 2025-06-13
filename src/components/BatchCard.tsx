
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, User, Package, Printer, FileText } from "lucide-react";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";

interface BatchCardProps {
  batch: ProductionBatch;
  onPrintLabels: (batch: ProductionBatch) => void;
  onCreatePackingSlip: (batch: ProductionBatch) => void;
}

export function BatchCard({ batch, onPrintLabels, onCreatePackingSlip }: BatchCardProps) {
  const isExpiringSoon = new Date(batch.expiry_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  const isExpired = new Date(batch.expiry_date) <= new Date();

  const getExpiryStatus = () => {
    if (isExpired) return { label: "Expired", variant: "destructive" as const };
    if (isExpiringSoon) return { label: "Expiring Soon", variant: "secondary" as const };
    return { label: "Fresh", variant: "default" as const };
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{batch.products.name}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">{batch.batch_number}</p>
          </div>
          <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{batch.chefs.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>{batch.packages_produced} packages</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Produced: {format(new Date(batch.production_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Expires: {format(new Date(batch.expiry_date), "MMM dd, yyyy")}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground">Package size:</p>
          <p>{batch.products.unit_size} {batch.products.unit_type} per package</p>
        </div>

        {batch.production_notes && (
          <div className="text-sm">
            <p className="text-muted-foreground">Notes:</p>
            <p className="text-foreground">{batch.production_notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPrintLabels(batch)}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Labels ({batch.packages_produced})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCreatePackingSlip(batch)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Packing Slip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
