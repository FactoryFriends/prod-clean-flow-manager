import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  const [numLabelsToPrint, setNumLabelsToPrint] = useState<number>(0);

  // Update the number of labels when batch changes
  useEffect(() => {
    if (batch) {
      setNumLabelsToPrint(batch.packages_produced);
    }
  }, [batch]);

  if (!batch) return null;

  const handlePrintLabels = async () => {
    if (numLabelsToPrint <= 0) {
      toast.error("Number of labels must be greater than 0");
      return;
    }

    setPrintingLabels(true);
    
    try {
      // Create a container for all labels
      const labelsContainer = document.createElement('div');
      labelsContainer.style.display = 'none';
      labelsContainer.id = 'labels-to-print';
      
      // Generate HTML for each label
      for (let i = 1; i <= numLabelsToPrint; i++) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label-page';
        labelDiv.style.pageBreakAfter = 'always';
        labelDiv.style.width = '89mm';
        labelDiv.style.height = '36mm';
        labelDiv.style.padding = '4px';
        labelDiv.style.border = '1px solid #000';
        labelDiv.style.fontFamily = 'Arial, sans-serif';
        labelDiv.style.fontSize = '8px';
        labelDiv.style.backgroundColor = 'white';
        labelDiv.style.color = 'black';
        labelDiv.style.display = 'flex';
        labelDiv.style.flexDirection = 'row';
        labelDiv.style.justifyContent = 'space-between';
        labelDiv.style.alignItems = 'center';
        labelDiv.style.boxSizing = 'border-box';

        labelDiv.innerHTML = `
          <div style="flex: 0 0 auto; text-align: center; padding-right: 8px; border-right: 1px solid #ccc;">
            <div style="font-size: 10px; font-weight: bold;">TOTHAI</div>
            <div style="font-size: 6px;">Kitchen</div>
          </div>

          <div style="flex: 1; padding: 0 8px;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 1px;">
              ${batch.products.name}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 7px; margin-bottom: 1px;">
              <span><strong>Batch:</strong> ${batch.batch_number}</span>
              <span><strong>Chef:</strong> ${batch.chefs.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 7px;">
              <span><strong>Prod:</strong> ${format(new Date(batch.production_date), 'dd/MM/yy')}</span>
              <span><strong>Exp:</strong> ${format(new Date(batch.expiry_date), 'dd/MM/yy')}</span>
            </div>
          </div>

          <div style="flex: 0 0 auto; text-align: center; border-left: 1px solid #ccc; padding-left: 8px;">
            <div style="font-size: 6px; margin-bottom: 1px;">QR</div>
            <div style="width: 20px; height: 20px; border: 1px dashed #666; font-size: 4px; display: flex; align-items: center; justify-content: center;">
              ${i}
            </div>
          </div>
        `;

        labelsContainer.appendChild(labelDiv);
      }

      // Add to document
      document.body.appendChild(labelsContainer);

      // Add print styles
      const printStyle = document.createElement('style');
      printStyle.innerHTML = `
        @media print {
           @page {
             size: 89mm 36mm;
             margin: 0;
           }
           .label-page {
             page-break-after: always;
             width: 89mm !important;
             height: 36mm !important;
            margin: 0 !important;
          }
          .label-page:last-child {
            page-break-after: avoid;
          }
          body > *:not(#labels-to-print) {
            display: none !important;
          }
          #labels-to-print {
            display: block !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      // Show the labels temporarily
      labelsContainer.style.display = 'block';
      
      // Use simple window.print
      window.print();
      
      // Cleanup after print
      setTimeout(() => {
        document.head.removeChild(printStyle);
        labelsContainer.style.display = 'none';
      }, 100);

      // Save label records to database
      const labelData = Array.from({ length: numLabelsToPrint }, (_, index) => ({
        batch_id: batch.id,
        label_number: index + 1,
        qr_code_data: {
          batch_number: batch.batch_number,
          product: batch.products.name,
          production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
          expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
          package_number: index + 1,
          chef: batch.chefs.name,
          location: batch.location,
          package_size: `${batch.products.unit_size} ${batch.products.unit_type}`
        }
      }));

      const { error } = await supabase
        .from("batch_labels")
        .insert(labelData);

      if (error) {
        console.error("Error saving labels:", error);
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(labelsContainer);
      }, 1000);
      
      toast.success(`${numLabelsToPrint} labels sent to printer successfully`);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error printing labels:", error);
      toast.error("Failed to print labels: " + (error as Error).message);
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
          {/* Batch Information */}
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

          {/* Number of Labels Input */}
          <div className="space-y-2">
            <Label htmlFor="numLabels">Number of Labels to Print</Label>
            <Input
              id="numLabels"
              type="number"
              min="1"
              value={numLabelsToPrint}
              onChange={(e) => setNumLabelsToPrint(parseInt(e.target.value) || 0)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Default: {batch.packages_produced} (from batch masterdata)
            </p>
          </div>

          {/* Label Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Label Preview (89mm x 36mm)
            </h3>
            
            {/* Direct HTML preview */}
            <div 
              style={{
                width: '89mm',
                height: '36mm',
                padding: '4px',
                border: '1px solid #000',
                fontFamily: 'Arial, sans-serif',
                fontSize: '8px',
                backgroundColor: 'white',
                color: 'black',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box',
                margin: '0 auto'
              }}
            >
              {/* Header */}
              <div style={{ flex: '0 0 auto', textAlign: 'center', paddingRight: '8px', borderRight: '1px solid #ccc' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>TOTHAI</div>
                <div style={{ fontSize: '6px' }}>Kitchen</div>
              </div>

              {/* Product Info */}
              <div style={{ flex: 1, padding: '0 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '1px' }}>
                  {batch.products.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', marginBottom: '1px' }}>
                  <span><strong>Batch:</strong> {batch.batch_number}</span>
                  <span><strong>Chef:</strong> {batch.chefs.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                  <span><strong>Prod:</strong> {format(new Date(batch.production_date), 'dd/MM/yy')}</span>
                  <span><strong>Exp:</strong> {format(new Date(batch.expiry_date), 'dd/MM/yy')}</span>
                </div>
              </div>

              {/* QR Code */}
              <div style={{ flex: '0 0 auto', textAlign: 'center', borderLeft: '1px solid #ccc', paddingLeft: '8px' }}>
                <div style={{ fontSize: '6px', marginBottom: '1px' }}>QR</div>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '1px dashed #666', 
                  fontSize: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  1
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Print format: 89mm x 36mm labels. Browser will open print dialog where you can select your printer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrintLabels} 
              disabled={printingLabels || numLabelsToPrint <= 0}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {printingLabels ? "Preparing..." : `Print ${numLabelsToPrint} Labels`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}