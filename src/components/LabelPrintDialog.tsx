import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";
import { Printer, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QZTrayPrinterService, LabelData } from "@/services/qzTrayPrinterService";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export function LabelPrintDialog({ open, onOpenChange, batch }: LabelPrintDialogProps) {
  const [printingLabels, setPrintingLabels] = useState(false);
  const [numLabelsToPrint, setNumLabelsToPrint] = useState<number>(0);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  const [printerStatus, setPrinterStatus] = useState<any>(null);
  const [qzTrayAvailable, setQzTrayAvailable] = useState<boolean>(false);

  // Check QZ Tray service availability when dialog opens
  useEffect(() => {
    if (open) {
      checkQZTrayService();
    }
  }, [open]);

  // Update the number of labels when batch changes
  useEffect(() => {
    if (batch) {
      setNumLabelsToPrint(batch.packages_produced);
    }
  }, [batch]);

  const checkQZTrayService = async () => {
    const available = QZTrayPrinterService.isAvailable();
    setQzTrayAvailable(available);
    
    if (available) {
      try {
        const initialized = await QZTrayPrinterService.initialize();
        setServiceAvailable(initialized);
        
        const status = await QZTrayPrinterService.getPrinterStatus();
        setPrinterStatus(status);
      } catch (error) {
        setServiceAvailable(false);
      }
    } else {
      setServiceAvailable(false);
    }
  };

  if (!batch) return null;

  const handlePrintLabels = async () => {
    if (numLabelsToPrint <= 0) {
      toast.error("Number of labels must be greater than 0");
      return;
    }

    if (!qzTrayAvailable) {
      toast.error("QZ Tray not available. Please install QZ Tray software.");
      return;
    }

    if (!serviceAvailable) {
      toast.error("QZ Tray not connected. Click the connect button first.");
      return;
    }

    setPrintingLabels(true);
    
    try {
      // Generate label data for each package
      const labelData: LabelData[] = Array.from({ length: numLabelsToPrint }, (_, index) => {
        const labelNumber = index + 1;
        return {
          batch_id: batch.id,
          label_number: labelNumber,
          qr_code_data: {
            batch_number: batch.batch_number,
            product: batch.products.name,
            production_date: format(new Date(batch.production_date), "dd/MM/yy"),
            expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
            package_number: labelNumber,
            chef: batch.chefs.name,
            location: batch.location,
            package_size: `${batch.products.unit_size} ${batch.products.unit_type}`
          }
        };
      });

      // Send to thermal printer via QZ Tray
      await QZTrayPrinterService.printLabels({
        labels: labelData,
        printer_config: {
          copies: 1,
          paper_size: "50.8x25.4mm",
          print_speed: 2
        }
      });

      // Save label records to database
      const { error } = await supabase
        .from("batch_labels")
        .insert(labelData);

      if (error) {
        throw error;
      }
      
      toast.success(`${numLabelsToPrint} labels sent to printer successfully`);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error printing labels:", error);
      toast.error("Failed to print labels: " + error.message);
    } finally {
      setPrintingLabels(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Print Labels via QZ Tray - {batch.batch_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QZ Tray Service Status */}
          <Alert className={serviceAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {serviceAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={serviceAvailable ? "text-green-800" : "text-red-800"}>
                {!qzTrayAvailable 
                  ? "QZ Tray not available - Please install QZ Tray software"
                  : serviceAvailable 
                    ? `QZ Tray connected - Found ${printerStatus?.available_printers || 0} printers`
                    : "QZ Tray not connected - Click connect button below"
                }
                {printerStatus?.recommended_printer && (
                  <div className="text-xs mt-1">
                    Recommended printer: {printerStatus.recommended_printer}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>

          {/* Connect/Disconnect Buttons */}
          {qzTrayAvailable && !serviceAvailable && (
            <div className="space-y-2">
              <Button 
                onClick={async () => {
                  try {
                    const connected = await QZTrayPrinterService.initialize();
                    setServiceAvailable(connected);
                    if (connected) {
                      const status = await QZTrayPrinterService.getPrinterStatus();
                      setPrinterStatus(status);
                      toast.success("QZ Tray connected successfully!");
                    }
                  } catch (error) {
                    toast.error("Failed to connect: " + error.message);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Connect to QZ Tray
              </Button>
              <p className="text-sm text-muted-foreground">
                Click to connect to QZ Tray and detect your LW650XL printer
              </p>
            </div>
          )}

          {/* Disconnect Button */}
          {qzTrayAvailable && serviceAvailable && (
            <div className="space-y-2 flex gap-2">
              <Button 
                variant="outline"
                onClick={async () => {
                  await QZTrayPrinterService.disconnect();
                  setServiceAvailable(false);
                  toast.success("QZ Tray disconnected");
                }}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Disconnect QZ Tray
              </Button>
              <Button 
                variant="secondary"
                onClick={async () => {
                  try {
                    await QZTrayPrinterService.testPrinter();
                    toast.success("Test print sent! Check printer for output.");
                  } catch (error) {
                    toast.error("Test failed: " + error.message);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Test Print
              </Button>
            </div>
          )}

          {/* Printer List */}
          {printerStatus?.printers && printerStatus.printers.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Available Printers</h3>
              <div className="space-y-1 text-sm">
                {printerStatus.printers.map((printer: string, index: number) => (
                  <div key={index} className={`p-2 rounded ${printer === printerStatus.recommended_printer ? 'bg-green-100 font-semibold' : 'bg-white'}`}>
                    {printer} {printer === printerStatus.recommended_printer && '(Recommended)'}
                  </div>
                ))}
              </div>
            </div>
          )}

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
              Thermal Label Preview (50.8 x 25.4mm - 1 of {numLabelsToPrint})
            </h3>
            
            {/* Thermal Label Preview - 50.8 x 25.4mm landscape format */}
            <div className="bg-white border-2 border-gray-400 mx-auto p-2" 
                 style={{ 
                   width: '192px',  // 50.8mm at 96dpi ≈ 192px
                   height: '96px',  // 25.4mm at 96dpi ≈ 96px
                   fontSize: '8px',
                   lineHeight: '1.1'
                 }}>
              <div className="h-full flex flex-col justify-between">
                {/* Product name - BOLD and larger at top */}
                <div className="font-bold text-center leading-tight" style={{ fontSize: '14px' }}>
                  {batch.products.name}
                </div>
                
                {/* Batch number - smaller font, centered */}
                <div className="text-center" style={{ fontSize: '9px' }}>
                  {batch.batch_number}
                </div>
                
                {/* Chef name - centered */}
                <div className="text-center" style={{ fontSize: '10px' }}>
                  Chef: {batch.chefs.name}
                </div>
                
                {/* Production date - centered */}
                <div className="text-center" style={{ fontSize: '9px' }}>
                  Prod: {format(new Date(batch.production_date), "dd/MM/yy")}
                </div>
                
                {/* Expiry date - BIG and BOLD at bottom */}
                <div className="text-center border-t pt-1">
                  <div className="font-bold leading-tight" style={{ fontSize: '12px' }}>
                    EXPIRES: {format(new Date(batch.expiry_date), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Thermal label format: 50.8 x 25.4mm (landscape). Sent via QZ Tray to LW650XL printer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrintLabels} 
              disabled={printingLabels || numLabelsToPrint <= 0 || !serviceAvailable}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {printingLabels ? "Printing..." : `Print ${numLabelsToPrint} Labels via QZ Tray`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}