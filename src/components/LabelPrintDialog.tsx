
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";
import { QrCode, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <DialogContent className="sm:max-w-[800px]">
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
            
            {/* Thermal Label Preview - 50.8 x 25.4mm landscape format */}
            <div className="bg-white border-2 border-gray-400 mx-auto" 
                 style={{ 
                   width: '192px',  // 50.8mm at 96dpi ≈ 192px
                   height: '96px',  // 25.4mm at 96dpi ≈ 96px
                   fontSize: '8px',
                   lineHeight: '1.1'
                 }}>
              <div className="flex h-full">
                {/* Left side - QR Code area */}
                <div className="w-20 h-full flex items-center justify-center bg-gray-50 border-r border-gray-300">
                  <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-xs font-bold">
                    QR
                  </div>
                </div>
                
                {/* Right side - Text content */}
                <div className="flex-1 p-1 flex flex-col justify-between">
                  {/* Product name - BOLD */}
                  <div className="font-bold text-xs leading-tight" style={{ fontSize: '10px' }}>
                    {batch.products.name}
                  </div>
                  
                  {/* Batch number */}
                  <div className="text-xs font-mono">
                    {batch.batch_number}
                  </div>
                  
                  {/* Production date */}
                  <div className="text-xs">
                    Prod: {format(new Date(batch.production_date), "dd/MM/yyyy")}
                  </div>
                  
                  {/* Expiry date - BIG and BOLD */}
                  <div className="font-bold text-sm leading-tight" style={{ fontSize: '12px' }}>
                    EXP: {format(new Date(batch.expiry_date), "dd/MM/yyyy")}
                  </div>
                  
                  {/* Chef name */}
                  <div className="text-xs">
                    Chef: {batch.chefs.name}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Thermal label format: 50.8 x 25.4mm (landscape). QR code contains: product name, batch number, production date, expiry date, package number, chef name, location, and package size.
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
