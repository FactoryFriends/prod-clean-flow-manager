import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, QrCode, Search, Package, Home, Store } from "lucide-react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { SelectedItem } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { BatchDetailsDialog } from "../BatchDetailsDialog";
import { QRScanner } from "../QRScanner";
import { InventoryItemCard } from "./InventoryItemCard";
import { toast } from "sonner";

interface InventoryBrowserProps {
  currentLocation: "tothai" | "khin";
  selectedItems: SelectedItem[];
  onAddToPackingList: (itemId: string, change: number) => void;
}

export function InventoryBrowser({ currentLocation, selectedItems, onAddToPackingList }: InventoryBrowserProps) {
  const { data: batches } = useProductionBatches(currentLocation);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [filter, setFilter] = useState<"self-produced" | "external">("self-produced");
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getSelectedQuantity = (itemId: string) => {
    return selectedItems.find(si => si.id === itemId)?.selectedQuantity || 0;
  };

  const isExpired = (date: string) => new Date(date) <= new Date();

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
        batchToAdd = availableBatches.find(batch => 
          batch.batchNumber === scannedData
        );
      } else if (scannedData.batch_id || scannedData.batch_number) {
        batchToAdd = availableBatches.find(batch => 
          batch.id === scannedData.batch_id || batch.batchNumber === scannedData.batch_number
        );
      }
      
      if (batchToAdd) {
        onAddToPackingList(batchToAdd.id, 1);
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

  // Filter items based on search query
  const filterBySearch = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const itemsToShow = filter === "self-produced" 
    ? filterBySearch(batchesToShow) 
    : filterBySearch(availableExternal);

  return (
    <>
      <div 
        className="border border-border rounded-lg bg-card"
        style={{ 
          height: '70vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div 
          className="p-4 border-b border-border"
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Available Inventory</h2>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex rounded-lg border border-border bg-muted p-1">
                <Button
                  variant={filter === "self-produced" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("self-produced")}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                    filter === "self-produced" 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  In-House
                </Button>
                <Button
                  variant={filter === "external" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("external")}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                    filter === "external" 
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  External
                </Button>
              </div>

              {filter === "self-produced" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrScannerOpen(true)}
                  className="flex items-center gap-1 text-xs"
                >
                  <QrCode className="w-3 h-3" />
                  Scan QR
                </Button>
              )}

              {filter === "self-produced" && expiredBatches.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExpired(!showExpired)}
                  className="flex items-center gap-1 text-xs"
                >
                  {showExpired ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showExpired ? 'Hide' : 'Show'} Expired ({expiredBatches.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Inventory List */}
        <div 
          className="flex-1 p-4 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          <div className="space-y-3">
            {itemsToShow.length > 0 ? (
              itemsToShow.map((item: any) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  alreadySelectedQuantity={getSelectedQuantity(item.id)}
                  onBatchClick={item.type === 'batch' ? handleBatchClick : undefined}
                  onAddToPackingList={onAddToPackingList}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No items match your search' : 'No items available'}
              </div>
            )}
          </div>
        </div>
      </div>

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