
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";
import { Printer } from "lucide-react";
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

  const handlePrintLabels = async () => {
    setPrintingLabels(true);
    
    try {
      // Generate label data for each package
      const labelData = Array.from({ length: batch.packages_produced }, (_, index) => {
        const labelNumber = index + 1;
        return {
          batch_id: batch.id,
          label_number: labelNumber,
          qr_code_data: {
            batch_number: batch.batch_number,
            product: batch.products.name,
            production_date: batch.production_date,
            expiry_date: batch.expiry_date,
            package_number: labelNumber,
            chef: batch.chefs.name,
            location: batch.location,
            package_size: `${batch.products.unit_size} ${batch.products.unit_type}`
          }
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
              <Printer className="w-4 h-4" />
              Label Preview (1 of {batch.packages_produced})
            </h3>
            
            {/* Thermal Label Preview - 50.8 x 25.4mm landscape format */}
            <div className="bg-white border-2 border-gray-400 mx-auto p-3" 
                 style={{ 
                   width: '192px',  // 50.8mm at 96dpi ≈ 192px
                   height: '96px',  // 25.4mm at 96dpi ≈ 96px
                   fontSize: '9px',
                   lineHeight: '1.1'
                 }}>
              <div className="h-full flex flex-col justify-between">
                {/* Product name - BOLD and larger, takes more space */}
                <div className="font-bold text-center leading-tight mb-1" style={{ fontSize: '12px' }}>
                  {batch.products.name}
                </div>
                
                {/* Main content area - using full width */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Batch and production info */}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col space-y-1 flex-1">
                      <div className="text-xs font-semibold">
                        {batch.batch_number}
                      </div>
                      <div className="text-xs">
                        Prod: {format(new Date(batch.production_date), "dd/MM/yy")}
                      </div>
                    </div>
                    
                    {/* Chef name */}
                    <div className="text-xs text-right flex-1">
                      Chef: {batch.chefs.name}
                    </div>
                  </div>
                  
                  {/* Expiry date - BIG and BOLD at bottom */}
                  <div className="text-center border-t pt-1">
                    <div className="font-bold leading-tight" style={{ fontSize: '10px' }}>
                      EXPIRES: {format(new Date(batch.expiry_date), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Thermal label format: 50.8 x 25.4mm (landscape). Contains: product name, batch number, production date, expiry date, and chef name.
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
