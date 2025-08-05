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
import QRCode from "qrcode";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export function LabelPrintDialog({ open, onOpenChange, batch }: LabelPrintDialogProps) {
  const [printingLabels, setPrintingLabels] = useState(false);
  const [numLabelsToPrint, setNumLabelsToPrint] = useState<number>(0);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");

  // Update the number of labels when batch changes
  useEffect(() => {
    if (batch) {
      setNumLabelsToPrint(batch.packages_produced);
      
      // Generate QR code for preview
      const qrData = JSON.stringify({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        product: batch.products.name,
        production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
        expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
        package_number: 1,
        chef: batch.chefs.name,
        location: batch.location,
        package_size: `${batch.products.unit_size} ${batch.products.unit_type}`,
        product_id: batch.product_id
      });

      QRCode.toDataURL(qrData, {
        width: 42,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setPreviewQRCode);
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
        // Create QR code data
        const qrData = JSON.stringify({
          batch_id: batch.id,
          batch_number: batch.batch_number,
          product: batch.products.name,
          production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
          expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
          package_number: i,
          chef: batch.chefs.name,
          location: batch.location,
          package_size: `${batch.products.unit_size} ${batch.products.unit_type}`,
          product_id: batch.product_id
        });

        // Generate QR code image
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 42,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        const labelDiv = document.createElement('div');
        labelDiv.className = 'label-page';
        labelDiv.style.pageBreakAfter = 'always';
        labelDiv.style.width = '102mm';
        labelDiv.style.height = '59mm';
        labelDiv.style.padding = '8px 13mm 8px 13mm';
        labelDiv.style.border = '1px solid #000';
        labelDiv.style.fontFamily = 'Arial, sans-serif';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.backgroundColor = 'white';
        labelDiv.style.color = 'black';
        labelDiv.style.display = 'flex';
        labelDiv.style.flexDirection = 'column';
        labelDiv.style.justifyContent = 'space-between';
        labelDiv.style.alignItems = 'stretch';
        labelDiv.style.boxSizing = 'border-box';

        labelDiv.innerHTML = `
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="font-size: 15px; font-weight: bold;">TOTHAI</div>
            <div style="font-size: 10px;">Production Kitchen</div>
          </div>

          <div style="flex: 1; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 2; padding-right: 10px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">
                ${batch.products.name}
              </div>
              <div style="font-size: 10px; margin-bottom: 3px;">
                <strong>Batch Number:</strong> ${batch.batch_number}
              </div>
              <div style="font-size: 10px; margin-bottom: 3px;">
                <strong>Chef:</strong> ${batch.chefs.name}
              </div>
              <div style="font-size: 10px; margin-bottom: 3px;">
                <strong>Production:</strong> ${format(new Date(batch.production_date), 'dd/MM/yyyy')}
              </div>
              <div style="font-size: 10px; margin-bottom: 3px;">
                <strong>Expiry:</strong> ${format(new Date(batch.expiry_date), 'dd/MM/yyyy')}
              </div>
              <div style="font-size: 10px;">
                <strong>Size:</strong> ${batch.products.unit_size} ${batch.products.unit_type}
              </div>
            </div>

            <div style="flex: 1; text-align: center; border-left: 2px solid #ccc; padding-left: 10px;">
              <div style="font-size: 8px; margin-bottom: 6px; font-weight: bold;">QR CODE</div>
              <img src="${qrCodeDataURL}" style="width: 42px; height: 42px; margin: 0 auto; display: block;" alt="QR Code ${i}" />
            </div>
          </div>

          <div style="text-align: center; font-size: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #ccc;">
            Label ${i} of ${numLabelsToPrint}
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
             size: 102mm 59mm;
             margin: 0;
           }
           .label-page {
             page-break-after: always;
             width: 102mm !important;
             height: 59mm !important;
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
              Label Preview (102mm x 59mm)
            </h3>
            
            {/* Direct HTML preview */}
            <div 
              style={{
                width: '102mm',
                height: '59mm',
                padding: '8px 13mm 8px 13mm',
                border: '1px solid #000',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                backgroundColor: 'white',
                color: 'black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                boxSizing: 'border-box',
                margin: '0 auto'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>TOTHAI</div>
                <div style={{ fontSize: '10px' }}>Production Kitchen</div>
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Product Info */}
                <div style={{ flex: 2, paddingRight: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                    {batch.products.name}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '3px' }}>
                    <strong>Batch Number:</strong> {batch.batch_number}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '3px' }}>
                    <strong>Chef:</strong> {batch.chefs.name}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '3px' }}>
                    <strong>Production:</strong> {format(new Date(batch.production_date), 'dd/MM/yyyy')}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '3px' }}>
                    <strong>Expiry:</strong> {format(new Date(batch.expiry_date), 'dd/MM/yyyy')}
                  </div>
                  <div style={{ fontSize: '10px' }}>
                    <strong>Size:</strong> {batch.products.unit_size} {batch.products.unit_type}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ flex: 1, textAlign: 'center', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
                  <div style={{ fontSize: '8px', marginBottom: '6px', fontWeight: 'bold' }}>QR CODE</div>
                  {previewQRCode ? (
                    <img 
                      src={previewQRCode} 
                      style={{ width: '42px', height: '42px', margin: '0 auto', display: 'block' }}
                      alt="Preview QR Code"
                    />
                  ) : (
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      border: '2px dashed #666', 
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '7px',
                      backgroundColor: '#f5f5f5'
                    }}>
                      1
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ccc' }}>
                Label 1 of {numLabelsToPrint}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Print format: 102mm x 59mm labels. Browser will open print dialog where you can select your printer.
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