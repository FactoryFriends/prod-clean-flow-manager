
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Check } from "lucide-react";

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
  const generatePackingSlipNumber = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `PS-${date}-${random}`;
  };

  const getCompanyInfo = () => {
    return {
      name: "OptiThai",
      subtitle: "Production Kitchen",
      address: "Wortegem, Belgium"
    };
  };

  const getDestination = () => {
    switch (customer) {
      case "khin-restaurant":
        return "KHIN Takeaway";
      case "tothai-restaurant":
        return "To Thai Restaurant";
      default:
        return "External Customer";
    }
  };

  const totalItems = selectedItems.length;
  const totalPackages = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

  const packingSlipNumber = generatePackingSlipNumber();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const companyInfo = getCompanyInfo();

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log("Download PDF functionality to be implemented");
  };

  const handleCopyDetails = () => {
    const details = `
Packing Slip: ${packingSlipNumber}
Date: ${currentDate}
Destination: ${getDestination()}
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
            <div>
              <h1 className="text-2xl font-bold text-red-600 mb-1">{companyInfo.name}</h1>
              <p className="text-gray-600">{companyInfo.subtitle}</p>
              <p className="text-gray-600">{companyInfo.address}</p>
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
              <p className="font-semibold">{getDestination()}</p>
              <p className="text-sm text-gray-600">Date: {currentDate}</p>
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
                <p className="font-semibold">{preparedBy}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Electronisch ondertekend door {preparedBy}
                </p>
                <p className="text-sm text-gray-600">Date: {currentDate}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Picked up by:</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="font-semibold">{pickedUpBy}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Electronisch ondertekend door {pickedUpBy}
                </p>
                <p className="text-sm text-gray-600">Date: {currentDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>This document serves as official transport documentation for FAVV compliance</p>
            <p>Generated by OptiThai Operations Management System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white"
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
