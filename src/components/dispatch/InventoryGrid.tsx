
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Eye, EyeOff, Filter, QrCode } from "lucide-react";
import { format } from "date-fns";
import { useProductionBatches } from "@/hooks/useProductionData";
import { SelectedItem } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { BatchDetailsDialog } from "../BatchDetailsDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { QRScanner } from "../QRScanner";
import { toast } from "sonner";

interface InventoryGridProps {
  currentLocation: "tothai" | "khin";
  selectedItems: SelectedItem[];
  onQuantityChange: (itemId: string, change: number) => void;
}

export function InventoryGrid({ currentLocation, selectedItems, onQuantityChange }: InventoryGridProps) {
  const { data: batches } = useProductionBatches(currentLocation);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [filter, setFilter] = useState<"self-produced" | "external">("self-produced");
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const getSelectedQuantity = (itemId: string) => {
    return selectedItems.find(si => si.id === itemId)?.selectedQuantity || 0;
  };

  const isExpired = (date: string) => new Date(date) <= new Date();
  const isExpiringSoon = (date: string) => new Date(date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const handleBatchClick = (batch: any) => {
    const batchDetails = {
      id: batch.id,
      name: batch.name,
      batchNumber: batch.batchNumber,
      availableQuantity: batch.availableQuantity,
      expiryDate: batch.expiryDate,
      productionDate: batch.productionDate,
      chef: batch.chef?.name,
      location: currentLocation,
      unitSize: batch.unitSize,
      unitType: batch.unitType,
      productionNotes: batch.productionNotes,
    };
    setSelectedBatch(batchDetails);
    setDetailsOpen(true);
  };

  const handleQRScan = (scannedData: any) => {
    try {
      let batchToAdd;
      
      if (typeof scannedData === 'string') {
        // Handle batch number string
        batchToAdd = availableBatches.find(batch => 
          batch.batchNumber === scannedData
        );
      } else if (scannedData.batch_id || scannedData.batch_number) {
        // Handle QR code JSON data
        batchToAdd = availableBatches.find(batch => 
          batch.id === scannedData.batch_id || batch.batchNumber === scannedData.batch_number
        );
      }
      
      if (batchToAdd) {
        onQuantityChange(batchToAdd.id, 1);
        toast.success(`Added 1 package of ${batchToAdd.name} (${batchToAdd.batchNumber})`);
      } else {
        toast.error("Batch not found in available inventory");
      }
    } catch (error) {
      toast.error("Invalid QR code data");
    }
  };

  // Convert batches to available inventory and sort alphabetically
  const availableBatches = (batches || [])
    .map(batch => ({
      id: batch.id,
      type: 'batch' as const,
      name: batch.products.name,
      batchNumber: batch.batch_number,
      availableQuantity: batch.packages_produced,
      selectedQuantity: 0,
      expiryDate: batch.expiry_date,
      productionDate: batch.production_date,
      chef: batch.chefs,
      unitSize: batch.products.unit_size,
      unitType: batch.products.unit_type,
      productionNotes: batch.production_notes,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter batches based on expiry status
  const activeBatches = availableBatches.filter(batch => 
    !batch.expiryDate || !isExpired(batch.expiryDate)
  );
  
  const expiredBatches = availableBatches.filter(batch => 
    batch.expiryDate && isExpired(batch.expiryDate)
  );

  const batchesToShow = showExpired ? availableBatches : activeBatches;

  // Sort external products alphabetically
  const availableExternal = externalProducts
    .map(product => ({
      id: product.id,
      type: 'external' as const,
      name: product.name,
      selectedQuantity: 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderInventoryItem = (item: any) => {
    const selectedQty = getSelectedQuantity(item.id);
    const expired = item.expiryDate && isExpired(item.expiryDate);
    const expiringSoon = item.expiryDate && isExpiringSoon(item.expiryDate);

    return (
      <div 
        key={item.id} 
        className={`bg-white border border-gray-200 rounded-lg p-6 ${expired ? 'opacity-60' : ''}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div 
              className={item.type === 'batch' ? "cursor-pointer" : ""}
              onClick={item.type === 'batch' ? () => handleBatchClick(item) : undefined}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.type === 'batch' ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">Batch: {item.batchNumber} • Available: {item.availableQuantity}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Source: {item.chef?.name} • Production: {item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : 'N/A'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600 mb-2">Source: External Supplier • Production: N/A</p>
              )}
            </div>
            
            <div className="flex gap-2 mb-3">
              {item.type === 'batch' ? (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                  Made In-House
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  External
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {item.availableQuantity || '∞'}
              </div>
              <div className="text-sm text-gray-500">
                {item.type === 'batch' ? (item.unitType === 'bags' ? 'bags' : 'containers') : 'units'} available
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0 text-lg font-bold"
              onClick={() => onQuantityChange(item.id, -1)}
              disabled={selectedQty === 0 || expired}
            >
              -
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold w-12 text-center">{selectedQty}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0 text-lg font-bold"
              onClick={() => onQuantityChange(item.id, 1)}
              disabled={item.availableQuantity && selectedQty >= item.availableQuantity || expired}
            >
              +
            </Button>
          </div>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            onClick={() => onQuantityChange(item.id, 1)}
            disabled={item.availableQuantity && selectedQty >= item.availableQuantity || expired}
          >
            Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Available Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filter Toggle and QR Scanner */}
            <div className="flex items-center gap-4">
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as "self-produced" | "external")}>
                <ToggleGroupItem 
                  value="self-produced" 
                  className="data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:border-orange-200"
                >
                  Self-produced
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="external"
                  className="data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-200"
                >
                  External
                </ToggleGroupItem>
              </ToggleGroup>

              {filter === "self-produced" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrScannerOpen(true)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <QrCode className="w-4 h-4" />
                  Scan QR Code
                </Button>
              )}

              {filter === "self-produced" && expiredBatches.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExpired(!showExpired)}
                  className="flex items-center gap-2"
                >
                  {showExpired ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showExpired ? 'Hide' : 'Show'} Expired ({expiredBatches.length})
                </Button>
              )}
            </div>

            {/* Inventory List */}
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4 pr-4">
                {filter === "self-produced" && batchesToShow.map(renderInventoryItem)}
                {filter === "external" && availableExternal.map(renderInventoryItem)}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <BatchDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        batch={selectedBatch}
      />

      <QRScanner
        open={qrScannerOpen}
        onOpenChange={setQrScannerOpen}
        onScan={handleQRScan}
        title="Scan Product QR Code"
      />
    </>
  );
}
