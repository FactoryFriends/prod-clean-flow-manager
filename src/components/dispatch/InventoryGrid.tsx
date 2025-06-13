
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { useProductionBatches } from "@/hooks/useProductionData";
import { SelectedItem } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";

interface InventoryGridProps {
  currentLocation: "tothai" | "khin";
  selectedItems: SelectedItem[];
  onQuantityChange: (itemId: string, change: number) => void;
}

export function InventoryGrid({ currentLocation, selectedItems, onQuantityChange }: InventoryGridProps) {
  const { data: batches } = useProductionBatches(currentLocation);

  const getSelectedQuantity = (itemId: string) => {
    return selectedItems.find(si => si.id === itemId)?.selectedQuantity || 0;
  };

  const isExpired = (date: string) => new Date(date) <= new Date();
  const isExpiringSoon = (date: string) => new Date(date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const getExpiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    if (isExpired(expiryDate)) {
      return <Badge variant="destructive" className="ml-2">Expired</Badge>;
    }
    if (isExpiringSoon(expiryDate)) {
      return <Badge variant="secondary" className="ml-2">Expiring Soon</Badge>;
    }
    return <Badge variant="default" className="ml-2">Fresh</Badge>;
  };

  // Convert batches to available inventory
  const availableBatches = (batches || []).map(batch => ({
    id: batch.id,
    type: 'batch' as const,
    name: batch.products.name,
    batchNumber: batch.batch_number,
    availableQuantity: batch.packages_produced,
    selectedQuantity: 0,
    expiryDate: batch.expiry_date,
    productionDate: batch.production_date,
  }));

  const availableExternal = externalProducts.map(product => ({
    id: product.id,
    type: 'external' as const,
    name: product.name,
    selectedQuantity: 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Self-Produced Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Self-Produced Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBatches.map(batch => {
                const selectedQty = getSelectedQuantity(batch.id);
                return (
                  <div key={batch.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{batch.name}</h4>
                        <p className="text-sm text-muted-foreground">Batch: {batch.batchNumber}</p>
                        {batch.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            Expires: {format(new Date(batch.expiryDate), "MMM dd, yyyy")}
                          </p>
                        )}
                        <p className="text-sm">Available: {batch.availableQuantity}</p>
                      </div>
                      {batch.expiryDate && getExpiryBadge(batch.expiryDate)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQuantityChange(batch.id, -1)}
                          disabled={selectedQty === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{selectedQty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQuantityChange(batch.id, 1)}
                          disabled={selectedQty >= (batch.availableQuantity || 0)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">External Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableExternal.map(product => {
                const selectedQty = getSelectedQuantity(product.id);
                return (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">External Product</p>
                      </div>
                      <Badge variant="outline">External</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQuantityChange(product.id, -1)}
                          disabled={selectedQty === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{selectedQty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQuantityChange(product.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
