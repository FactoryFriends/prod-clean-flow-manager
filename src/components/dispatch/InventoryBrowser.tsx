import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, QrCode, Search, Package } from "lucide-react";
import { format } from "date-fns";
import { useProductionBatches } from "@/hooks/useProductionData";
import { SelectedItem } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { BatchDetailsDialog } from "../BatchDetailsDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { QRScanner } from "../QRScanner";
import { toast } from "sonner";

interface InventoryBrowserProps {
  currentLocation: "tothai" | "khin";
  selectedItems: SelectedItem[];
  onQuantityChange: (itemId: string, change: number) => void;
}

export function InventoryBrowser({ currentLocation, selectedItems, onQuantityChange }: InventoryBrowserProps) {
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
        batchToAdd = availableBatches.find(batch => 
          batch.batchNumber === scannedData
        );
      } else if (scannedData.batch_id || scannedData.batch_number) {
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

  const renderInventoryItem = (item: any) => {
    const selectedQty = getSelectedQuantity(item.id);
    const expired = item.expiryDate && isExpired(item.expiryDate);
    const expiringSoon = item.expiryDate && isExpiringSoon(item.expiryDate);

    return (
      <div 
        key={item.id} 
        className={`border border-border rounded-lg p-4 transition-all hover:shadow-sm ${
          expired ? 'opacity-60' : ''
        } ${selectedQty > 0 ? 'bg-accent/10 border-accent' : 'bg-card'}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div 
              className={item.type === 'batch' ? "cursor-pointer" : ""}
              onClick={item.type === 'batch' ? () => handleBatchClick(item) : undefined}
            >
              <h3 className="font-medium text-card-foreground mb-1">{item.name}</h3>
              {item.type === 'batch' ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Batch: {item.batchNumber} • Available: {item.availableQuantity}</p>
                  <p>Source: {item.chef?.name} • {item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : 'N/A'}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">External supplier</p>
              )}
            </div>
            
            <div className="flex gap-2 mt-2">
              {item.type === 'batch' ? (
                <Badge variant="secondary" className="text-xs">
                  In-House
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  External
                </Badge>
              )}
              {selectedQty > 0 && (
                <Badge variant="default" className="text-xs">
                  Selected: {selectedQty}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {item.availableQuantity || '∞'}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.type === 'batch' ? (item.unitType === 'bags' ? 'bags' : 'containers') : 'units'} available
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => onQuantityChange(item.id, -1)}
              disabled={selectedQty === 0 || expired}
            >
              -
            </Button>
            
            <span className="w-8 text-center font-medium">{selectedQty}</span>

            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => onQuantityChange(item.id, 1)}
              disabled={item.availableQuantity && selectedQty >= item.availableQuantity || expired}
            >
              +
            </Button>
          </div>

          <Button 
            size="sm"
            onClick={() => onQuantityChange(item.id, 1)}
            disabled={item.availableQuantity && selectedQty >= item.availableQuantity || expired}
            className="bg-primary hover:bg-primary/90"
          >
            <Package className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5" />
            Available Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Search and Filters */}
          <div className="space-y-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as "self-produced" | "external")}>
                <ToggleGroupItem value="self-produced" className="text-xs">
                  In-House
                </ToggleGroupItem>
                <ToggleGroupItem value="external" className="text-xs">
                  External
                </ToggleGroupItem>
              </ToggleGroup>

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

          {/* Inventory List */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-3 pb-4">
                {itemsToShow.length > 0 ? (
                  itemsToShow.map(renderInventoryItem)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No items match your search' : 'No items available'}
                  </div>
                )}
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