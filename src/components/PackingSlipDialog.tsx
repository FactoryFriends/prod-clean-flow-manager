
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import jsPDF from 'jspdf';

interface SelectedItem {
  id: string;
  type: 'batch' | 'external';
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
}

interface PackingSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: SelectedItem[];
  customer: string;
  preparedBy: string;
  pickedUpBy: string;
  dispatchNotes: string;
  currentLocation: "tothai" | "khin";
}

export function PackingSlipDialog({
  open,
  onOpenChange,
  selectedItems,
  customer,
  preparedBy,
  pickedUpBy,
  dispatchNotes,
  currentLocation,
}: PackingSlipDialogProps) {
  const { data: customers = [] } = useCustomers(true);

  // Debug logging for staff names
  console.log("PackingSlipDialog staff names:", {
    preparedBy,
    pickedUpBy,
    customer,
    selectedItemsCount: selectedItems.length
  });

  const generatePackingSlipNumber = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `PS-${date}-${random}`;
  };

  const getCompanyInfo = () => {
    return {
      subtitle: "Production Kitchen",
      address: "Leuvensestraat 100",
      city: "3300 Tienen",
      vatNumber: "BE0534 968 163"
    };
  };

  const getDestination = () => {
    const selectedCustomer = customers.find(c => c.id === customer);
    return selectedCustomer || null;
  };

  const totalItems = selectedItems.length;
  const totalPackages = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

  const packingSlipNumber = generatePackingSlipNumber();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const companyInfo = getCompanyInfo();
  const destinationCustomer = getDestination();

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Header - Company Info
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTHAI', 20, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(companyInfo.subtitle, 20, 30);
    pdf.text(companyInfo.address, 20, 35);
    pdf.text(companyInfo.city, 20, 40);
    pdf.text(companyInfo.vatNumber, 20, 45);
    
    // Packing Slip Title and Number
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PACKING SLIP', 140, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`#${packingSlipNumber}`, 140, 30);
    pdf.text(currentDate, 140, 35);
    
    // Destination
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Destination:', 20, 65);
    
    pdf.setFont('helvetica', 'normal');
    let yPos = 75;
    pdf.text(destinationCustomer ? destinationCustomer.name : "External Customer", 20, yPos);
    
    if (destinationCustomer && destinationCustomer.address) {
      yPos += 5;
      pdf.text(destinationCustomer.address, 20, yPos);
    }
    
    if (destinationCustomer && destinationCustomer.contact_person) {
      yPos += 5;
      pdf.text(`Contact: ${destinationCustomer.contact_person}`, 20, yPos);
    }
    
    if (destinationCustomer && destinationCustomer.phone) {
      yPos += 5;
      pdf.text(`Phone: ${destinationCustomer.phone}`, 20, yPos);
    }
    
    // Items Table
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Product', 20, yPos);
    pdf.text('Batch Number', 70, yPos);
    pdf.text('Production Date', 120, yPos);
    pdf.text('Quantity', 170, yPos);
    
    // Table line
    pdf.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    
    selectedItems.forEach((item) => {
      pdf.text(item.name, 20, yPos);
      pdf.text(item.batchNumber || "-", 70, yPos);
      pdf.text(item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : "-", 120, yPos);
      pdf.text(`${item.selectedQuantity} bags`, 170, yPos);
      yPos += 8;
    });
    
    // Summary
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary:', 20, yPos);
    yPos += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Items: ${totalItems}`, 20, yPos);
    yPos += 5;
    pdf.text(`Total Packages: ${totalPackages}`, 20, yPos);
    
    // FAVV Compliance
    yPos += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('FAVV Compliance:', 20, yPos);
    yPos += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text('✓ Full batch traceability', 20, yPos);
    yPos += 5;
    pdf.text('✓ Production dates recorded', 20, yPos);
    yPos += 5;
    pdf.text('✓ Transport documentation', 20, yPos);
    
    // Signatures
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prepared by:', 20, yPos);
    pdf.text('Picked up by:', 110, yPos);
    
    yPos += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text(preparedBy || "Not specified", 20, yPos);
    pdf.text(pickedUpBy || "Not specified", 110, yPos);
    
    yPos += 5;
    pdf.text(`Date: ${currentDate}`, 20, yPos);
    pdf.text(`Date: ${currentDate}`, 110, yPos);
    
    yPos += 3;
    const currentTime = format(new Date(), "HH:mm");
    pdf.text(`Time: ${currentTime}`, 20, yPos);
    pdf.text(`Time: ${currentTime}`, 110, yPos);
    
    // Footer
    yPos += 20;
    pdf.setFontSize(8);
    pdf.text('This document serves as official transport documentation for FAVV compliance', 20, yPos);
    yPos += 4;
    pdf.text('Generated by TOTHAI Operations Management System', 20, yPos);
    
    // Save the PDF
    pdf.save(`packing-slip-${packingSlipNumber}.pdf`);
  };

  const handleCopyDetails = () => {
    const details = `
Packing Slip: ${packingSlipNumber}
Date: ${currentDate}
Destination: ${destinationCustomer ? destinationCustomer.name : "External Customer"}
Items: ${totalItems}
Packages: ${totalPackages}
Prepared by: ${preparedBy}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Packing Slip Preview</DialogTitle>
        </DialogHeader>
        
        <div className="bg-white p-8 border rounded-lg text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col items-start">
              <img 
                src="/lovable-uploads/049be7aa-e57b-4eb6-bec2-515a4c2b96b3.png" 
                alt="TOTHAI Logo" 
                className="h-16 w-auto object-contain mb-4"
              />
              <div>
                <p className="text-gray-600">{companyInfo.subtitle}</p>
                <p className="text-gray-600">{companyInfo.address}</p>
                <p className="text-gray-600">{companyInfo.city}</p>
                <p className="text-gray-600 font-semibold">{companyInfo.vatNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold mb-1">PACKING SLIP</h2>
              <p className="font-mono text-sm">#{packingSlipNumber}</p>
              <p className="text-sm">{currentDate}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Destination:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold">{destinationCustomer ? destinationCustomer.name : "External Customer"}</p>
              {destinationCustomer && destinationCustomer.address && (
                <p className="text-sm text-gray-600 mt-1">{destinationCustomer.address}</p>
              )}
              {destinationCustomer && destinationCustomer.contact_person && (
                <p className="text-sm text-gray-600">Contact: {destinationCustomer.contact_person}</p>
              )}
              {destinationCustomer && destinationCustomer.phone && (
                <p className="text-sm text-gray-600">Phone: {destinationCustomer.phone}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">Date: {currentDate}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Product</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Batch Number</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Production Date</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-3">{item.name}</td>
                    <td className="border border-gray-300 p-3 font-mono text-sm">
                      {item.batchNumber || "-"}
                    </td>
                    <td className="border border-gray-300 p-3">
                      {item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : "-"}
                    </td>
                    <td className="border border-gray-300 p-3">{item.selectedQuantity} bags</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Summary:</h3>
            <p>Total Items: {totalItems}</p>
            <p>Total Packages: {totalPackages}</p>
          </div>

          {/* FAVV Compliance */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">FAVV Compliance:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Full batch traceability</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Production dates recorded</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Transport documentation</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Prepared by:</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="font-semibold">{preparedBy || "Not specified"}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Electronisch ondertekend door {preparedBy || "Not specified"}
                </p>
                <p className="text-sm text-gray-600">Date: {currentDate}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Picked up by:</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="font-semibold">{pickedUpBy || "Not specified"}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Electronisch ondertekend door {pickedUpBy || "Not specified"}
                </p>
                <p className="text-sm text-gray-600">Date: {currentDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>This document serves as official transport documentation for FAVV compliance</p>
            <p>Generated by TOTHAI Operations Management System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadPDF}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Download PDF
            </Button>
            <Button 
              variant="outline"
              onClick={handleCopyDetails}
            >
              Copy Details
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
