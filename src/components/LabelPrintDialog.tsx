
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";
import { QrCode, Printer } from "lucide-react";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export function LabelPrintDialog({ open, onOpenChange, batch }: LabelPrintDialogProps) {
  const [printingLabels, setPrintingLabels] = useState(false);

  if (!batch) return null;

  const generateQRCodeData = (labelNumber: number) => {
    return {
      batch_number: batch.batch_number,
      product: batch.products.name,
      production_date: batch.production_date,
      expiry_date: batch.expiry_date,
      package_number: labelNumber,
      chef: batch.chefs.name,
      location: batch.location,
      package_size: `${batch.products.unit_size} ${batch.products.unit_type}`
    };
  };

  const handlePrintLabels = async () => {
    setPrintingLabels(true);
    
    try {
      // Generate label data for each package
      const labelData = Array.from({ length: batch.packages_produced }, (_, index) => {
        const labelNumber = index + 1;
        return {
          batch_id: batch.id,
          label_number: labelNumber,
          qr_code_data: generateQRCodeData(labelNumber)
        };
      });

      // Save label records to database
      const { error } = await supabase
        .from("batch_labels")
        .insert(labelData);

      if (error) {
        throw error;
      }

      // Here you would integrate with your thermal printer
      // For now, we'll just simulate the printing process
      console.log("Printing labels:", labelData);
      
      // You could open a print dialog or send to a thermal printer service
      window.print(); // This would print the preview
      
      toast.success(`${batch.packages_produced} labels printed successfully`);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error printing labels:", error);
      toast.error("Failed to print labels");
    } finally {
      setPrintingLabels(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Print Labels - {batch.batch_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Batch Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Product: {batch.products.name}</div>
              <div>Packages: {batch.packages_produced}</div>
              <div>Size: {batch.products.unit_size} {batch.products.unit_type}</div>
              <div>Chef: {batch.chefs.name}</div>
              <div>Production: {format(new Date(batch.production_date), "MMM dd, yyyy")}</div>
              <div>Expires: {format(new Date(batch.expiry_date), "MMM dd, yyyy")}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Label Preview (1 of {batch.packages_produced})
            </h3>
            <div className="bg-white border-2 border-dashed border-gray-300 p-4 text-center space-y-2 font-mono text-xs">
              <div className="font-bold text-lg">{batch.products.name}</div>
              <div className="text-2xl">📦 QR CODE 📦</div>
              <div className="space-y-1">
                <div>Batch: {batch.batch_number}</div>
                <div>Package: 1 of {batch.packages_produced}</div>
                <div>Size: {batch.products.unit_size} {batch.products.unit_type}</div>
                <div>Produced: {format(new Date(batch.production_date), "dd/MM/yyyy")}</div>
                <div>Expires: {format(new Date(batch.expiry_date), "dd/MM/yyyy")}</div>
                <div>Chef: {batch.chefs.name}</div>
                <div>Location: {batch.location.toUpperCase()}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This preview shows what will be printed on each thermal label
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrintLabels} 
              disabled={printingLabels}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {printingLabels ? "Printing..." : `Print ${batch.packages_produced} Labels`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
