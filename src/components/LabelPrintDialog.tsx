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
import { sanitizeText, setSafeTextContent } from "@/utils/htmlSanitizer";

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
      
      // Generate QR code for preview with sanitized data
      const validateField = (value: any, maxLength: number = 100): string => {
        const sanitized = sanitizeText(String(value || ""));
        return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + "..." : sanitized;
      };

      const qrData = JSON.stringify({
        batch_id: batch.id,
        batch_number: validateField(batch.batch_number, 30),
        product: validateField(batch.products.name, 50),
        production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
        expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
        package_number: 1,
        chef: validateField(batch.chefs.name, 30),
        location: validateField(batch.location, 30),
        package_size: `${validateField(String(batch.products.unit_size), 10)} ${validateField(batch.products.unit_type, 10)}`,
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

    // Security validation: Limit maximum labels to prevent memory issues
    if (numLabelsToPrint > 1000) {
      toast.error("Cannot print more than 1000 labels at once for security reasons");
      return;
    }

    // Validate and sanitize batch data for QR code generation
    const validateField = (value: any, maxLength: number = 100): string => {
      const sanitized = sanitizeText(String(value || ""));
      return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + "..." : sanitized;
    };

    const safeProductName = validateField(batch.products.name, 50);
    const safeBatchNumber = validateField(batch.batch_number, 30);
    const safeChefName = validateField(batch.chefs.name, 30);
    const safeLocation = validateField(batch.location, 30);

    setPrintingLabels(true);
    
    try {
      // Create a container for all labels
      const labelsContainer = document.createElement('div');
      labelsContainer.style.display = 'none';
      labelsContainer.id = 'labels-to-print';
      
      // Generate HTML for each label
      for (let i = 1; i <= numLabelsToPrint; i++) {
        // Create QR code data with sanitized values
        const qrData = JSON.stringify({
          batch_id: batch.id,
          batch_number: safeBatchNumber,
          product: safeProductName,
          production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
          expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
          package_number: i,
          chef: safeChefName,
          location: safeLocation,
          package_size: `${validateField(String(batch.products.unit_size), 10)} ${validateField(batch.products.unit_type, 10)}`,
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
        labelDiv.style.padding = '5.5mm 13mm 8px 13mm';
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

        // Create label content using safe DOM manipulation
        const createLabelContent = () => {
          // Header section
          const headerDiv = document.createElement('div');
          headerDiv.style.textAlign = 'center';
          headerDiv.style.borderBottom = '2px solid #000';
          headerDiv.style.paddingBottom = '6px';
          headerDiv.style.marginBottom = '6px';

          const productNameDiv = document.createElement('div');
          productNameDiv.style.fontSize = '15px';
          productNameDiv.style.fontWeight = 'bold';
          setSafeTextContent(productNameDiv, batch.products.name);
          headerDiv.appendChild(productNameDiv);

          if (batch.products.name_thai) {
            const thaiNameDiv = document.createElement('div');
            thaiNameDiv.style.fontSize = '12px';
            thaiNameDiv.style.marginTop = '2px';
            setSafeTextContent(thaiNameDiv, batch.products.name_thai);
            headerDiv.appendChild(thaiNameDiv);
          }

          // Main content section
          const mainContentDiv = document.createElement('div');
          mainContentDiv.style.flex = '1';
          mainContentDiv.style.display = 'flex';
          mainContentDiv.style.flexDirection = 'column';

          // Product info and QR code container
          const infoQrContainer = document.createElement('div');
          infoQrContainer.style.display = 'flex';
          infoQrContainer.style.justifyContent = 'space-between';
          infoQrContainer.style.alignItems = 'flex-start';
          infoQrContainer.style.marginBottom = '6px';

          // Product info section
          const productInfoDiv = document.createElement('div');
          productInfoDiv.style.flex = '2';
          productInfoDiv.style.paddingRight = '10px';

          // Batch info
          const batchInfoDiv = document.createElement('div');
          batchInfoDiv.style.fontSize = '11px';
          batchInfoDiv.style.marginBottom = '2px';
          batchInfoDiv.style.fontWeight = 'bold';
          const batchLabel = document.createElement('strong');
          batchLabel.textContent = 'Batch: ';
          batchInfoDiv.appendChild(batchLabel);
          batchInfoDiv.appendChild(document.createTextNode(sanitizeText(batch.batch_number)));
          productInfoDiv.appendChild(batchInfoDiv);

          // Chef info
          const chefInfoDiv = document.createElement('div');
          chefInfoDiv.style.fontSize = '9px';
          chefInfoDiv.style.marginBottom = '2px';
          const chefLabel = document.createElement('strong');
          chefLabel.textContent = 'Chef: ';
          chefInfoDiv.appendChild(chefLabel);
          chefInfoDiv.appendChild(document.createTextNode(sanitizeText(batch.chefs.name)));
          productInfoDiv.appendChild(chefInfoDiv);

          // Production date info
          const productionInfoDiv = document.createElement('div');
          productionInfoDiv.style.fontSize = '9px';
          productionInfoDiv.style.marginBottom = '2px';
          const productionLabel = document.createElement('strong');
          productionLabel.textContent = 'Production: ';
          productionInfoDiv.appendChild(productionLabel);
          productionInfoDiv.appendChild(document.createTextNode(format(new Date(batch.production_date), 'dd/MM/yyyy')));
          productInfoDiv.appendChild(productionInfoDiv);

          // Size info
          const sizeInfoDiv = document.createElement('div');
          sizeInfoDiv.style.fontSize = '9px';
          const sizeLabel = document.createElement('strong');
          sizeLabel.textContent = 'Size: ';
          sizeInfoDiv.appendChild(sizeLabel);
          sizeInfoDiv.appendChild(document.createTextNode(`${sanitizeText(String(batch.products.unit_size))} ${sanitizeText(batch.products.unit_type)}`));
          productInfoDiv.appendChild(sizeInfoDiv);

          // QR Code section
          const qrCodeDiv = document.createElement('div');
          qrCodeDiv.style.flex = '1';
          qrCodeDiv.style.textAlign = 'center';
          qrCodeDiv.style.borderLeft = '2px solid #ccc';
          qrCodeDiv.style.paddingLeft = '10px';

          const qrLabel = document.createElement('div');
          qrLabel.style.fontSize = '8px';
          qrLabel.style.marginBottom = '6px';
          qrLabel.style.fontWeight = 'bold';
          qrLabel.textContent = 'QR CODE';
          qrCodeDiv.appendChild(qrLabel);

          const qrImg = document.createElement('img');
          qrImg.src = qrCodeDataURL;
          qrImg.style.width = '42px';
          qrImg.style.height = '42px';
          qrImg.style.margin = '0 auto';
          qrImg.style.display = 'block';
          qrImg.alt = `QR Code ${i}`;
          qrCodeDiv.appendChild(qrImg);

          infoQrContainer.appendChild(productInfoDiv);
          infoQrContainer.appendChild(qrCodeDiv);
          mainContentDiv.appendChild(infoQrContainer);

          // Expiry info (if applicable)
          if (batch.products.product_type === "zelfgemaakt") {
            const expiryDiv = document.createElement('div');
            expiryDiv.style.fontSize = '12px';
            expiryDiv.style.fontWeight = 'bold';
            expiryDiv.style.border = '2px solid #000';
            expiryDiv.style.padding = '4px';
            expiryDiv.style.textAlign = 'center';
            expiryDiv.style.marginTop = '4px';
            expiryDiv.textContent = `EXPIRY: ${format(new Date(batch.expiry_date), 'dd/MM/yyyy')} (${format(new Date(batch.expiry_date), 'EEEE')})`;
            mainContentDiv.appendChild(expiryDiv);
          }

          // Quantity info (if applicable)
          if (batch.items_per_package) {
            const qtyDiv = document.createElement('div');
            qtyDiv.style.fontSize = '10px';
            qtyDiv.style.fontWeight = 'bold';
            qtyDiv.style.textAlign = 'center';
            qtyDiv.style.marginTop = '2px';
            qtyDiv.style.backgroundColor = '#f0f0f0';
            qtyDiv.style.padding = '2px';
            qtyDiv.textContent = `QTY: ${batch.items_per_package} items per package`;
            mainContentDiv.appendChild(qtyDiv);
          }

          // Footer section
          const footerDiv = document.createElement('div');
          footerDiv.style.textAlign = 'center';
          footerDiv.style.fontSize = '8px';
          footerDiv.style.marginTop = '6px';
          footerDiv.style.paddingTop = '6px';
          footerDiv.style.borderTop = '1px solid #ccc';
          footerDiv.style.display = 'flex';
          footerDiv.style.justifyContent = 'space-between';
          footerDiv.style.alignItems = 'center';

          const companySpan = document.createElement('span');
          companySpan.style.fontSize = '7px';
          companySpan.textContent = 'TOTHAI Production Kitchen';
          footerDiv.appendChild(companySpan);

          const labelCountSpan = document.createElement('span');
          labelCountSpan.textContent = `Label ${i} of ${numLabelsToPrint}`;
          footerDiv.appendChild(labelCountSpan);

          return { headerDiv, mainContentDiv, footerDiv };
        };

        const { headerDiv, mainContentDiv, footerDiv } = createLabelContent();
        labelDiv.appendChild(headerDiv);
        labelDiv.appendChild(mainContentDiv);
        labelDiv.appendChild(footerDiv);

        labelsContainer.appendChild(labelDiv);
      }

      // Add to document
      document.body.appendChild(labelsContainer);

      // Add print styles (using textContent for security)
      const printStyle = document.createElement('style');
      printStyle.textContent = `
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

      // Save label records to database with sanitized data
      const labelData = Array.from({ length: numLabelsToPrint }, (_, index) => ({
        batch_id: batch.id,
        label_number: index + 1,
        qr_code_data: {
          batch_number: safeBatchNumber,
          product: safeProductName,
          production_date: format(new Date(batch.production_date), "dd/MM/yyyy"),
          expiry_date: format(new Date(batch.expiry_date), "dd/MM/yyyy"),
          package_number: index + 1,
          chef: safeChefName,
          location: safeLocation,
          package_size: `${validateField(String(batch.products.unit_size), 10)} ${validateField(batch.products.unit_type, 10)}`
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
            <div className="flex items-center gap-3">
              <Input
                id="numLabels"
                type="number"
                min="1"
                value={numLabelsToPrint}
                onChange={(e) => setNumLabelsToPrint(parseInt(e.target.value) || 0)}
                className="w-32"
              />
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
                padding: '5.5mm 13mm 8px 13mm',
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
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{batch.products.name}</div>
                {batch.products.name_thai && (
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>{batch.products.name_thai}</div>
                )}
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  {/* Product Info */}
                  <div style={{ flex: 2, paddingRight: '10px' }}>
                    <div style={{ fontSize: '11px', marginBottom: '2px', fontWeight: 'bold' }}>
                      <strong>Batch:</strong> {batch.batch_number}
                    </div>
                    <div style={{ fontSize: '9px', marginBottom: '2px' }}>
                      <strong>Chef:</strong> {batch.chefs.name}
                    </div>
                    <div style={{ fontSize: '9px', marginBottom: '2px' }}>
                      <strong>Production:</strong> {format(new Date(batch.production_date), 'dd/MM/yyyy')}
                    </div>
                    <div style={{ fontSize: '9px' }}>
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
                
                {batch.products.product_type === "zelfgemaakt" && (
                  <div style={{ fontSize: '12px', fontWeight: 'bold', border: '2px solid #000', padding: '4px', textAlign: 'center', marginTop: '4px' }}>
                    EXPIRY: {format(new Date(batch.expiry_date), 'dd/MM/yyyy')} ({format(new Date(batch.expiry_date), 'EEEE')})
                  </div>
                )}
                
                {batch.items_per_package && (
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginTop: '2px', backgroundColor: '#f0f0f0', padding: '2px' }}>
                    QTY: {batch.items_per_package} items per package
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '7px' }}>TOTHAI Production Kitchen</span>
                <span>Label 1 of {numLabelsToPrint}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Print format: 102mm x 59mm labels. Browser will open print dialog where you can select your printer.
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}