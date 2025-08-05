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
import { LabelTemplate } from "./LabelTemplate";
import printJS from "print-js";

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
        labelDiv.style.width = '4in';
        labelDiv.style.height = '3in';
        labelDiv.style.padding = '8px';
        labelDiv.style.border = '1px solid #000';
        labelDiv.style.fontFamily = 'Arial, sans-serif';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.backgroundColor = 'white';
        labelDiv.style.color = 'black';
        labelDiv.style.display = 'flex';
        labelDiv.style.flexDirection = 'column';
        labelDiv.style.justifyContent = 'space-between';
        labelDiv.style.boxSizing = 'border-box';

        labelDiv.innerHTML = `
          <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 4px;">
            <div style="font-size: 16px; font-weight: bold;">TOTHAI</div>
            <div style="font-size: 10px;">Production Kitchen</div>
          </div>

          <div style="flex: 1; padding: 8px 0;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
              ${batch.products.name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span><strong>Batch:</strong> ${batch.batch_number}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span><strong>Prod:</strong> ${format(new Date(batch.production_date), 'dd/MM/yyyy')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span><strong>Exp:</strong> ${format(new Date(batch.expiry_date), 'dd/MM/yyyy')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span><strong>Chef:</strong> ${batch.chefs.name}</span>
            </div>
          </div>

          <div style="text-align: center; border: 1px dashed #666; padding: 8px; background-color: #f5f5f5;">
            <div style="font-size: 8px; margin-bottom: 2px;">QR Code Data</div>
            <div style="font-size: 6px; word-break: break-all;">
              BATCH:${batch.batch_number}|PROD:${format(new Date(batch.production_date), 'dd/MM/yyyy')}|EXP:${format(new Date(batch.expiry_date), 'dd/MM/yyyy')}
            </div>
          </div>

          <div style="text-align: center; font-size: 8px; margin-top: 4px;">
            Label ${i} of ${numLabelsToPrint}
          </div>
        `;

        labelsContainer.appendChild(labelDiv);
      }

      // Add to document
      document.body.appendChild(labelsContainer);

      // Print using PrintJS
      printJS({
        printable: 'labels-to-print',
        type: 'html',
        targetStyles: ['*'],
        style: `
          @media print {
            @page {
              size: 4in 3in;
              margin: 0;
            }
            .label-page {
              page-break-after: always;
              width: 4in !important;
              height: 3in !important;
              margin: 0 !important;
            }
            .label-page:last-child {
              page-break-after: avoid;
            }
          }
        `
      });

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
              Label Preview (4" x 3")
            </h3>
            
            <LabelTemplate
              batchId={batch.id}
              productName={batch.products.name}
              batchNumber={batch.batch_number}
              productionDate={batch.production_date}
              expiryDate={batch.expiry_date}
              labelNumber={1}
              totalLabels={numLabelsToPrint}
            />
            
            <p className="text-sm text-muted-foreground mt-3">
              Print format: 4" x 3" labels. Browser will open print dialog where you can select your printer.
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