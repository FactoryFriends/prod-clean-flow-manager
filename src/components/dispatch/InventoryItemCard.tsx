import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { format } from "date-fns";

interface InventoryItem {
  id: string;
  type: 'batch' | 'external';
  name: string;
  batchNumber?: string;
  availableQuantity?: number;
  expiryDate?: string;
  productionDate?: string;
  chef?: { name: string };
  unitSize?: number;
  unitType?: string;
  productionNotes?: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  alreadySelectedQuantity: number;
  onBatchClick?: (item: InventoryItem) => void;
  onAddToPackingList: (itemId: string, quantity: number) => void;
}

export function InventoryItemCard({ 
  item, 
  alreadySelectedQuantity, 
  onBatchClick, 
  onAddToPackingList 
}: InventoryItemCardProps) {
  const [pendingQuantity, setPendingQuantity] = useState(1);

  const isExpired = (date: string) => new Date(date) <= new Date();
  const expired = item.expiryDate && isExpired(item.expiryDate);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, pendingQuantity + change);
    const maxAvailable = (item.availableQuantity || 999) - alreadySelectedQuantity;
    setPendingQuantity(Math.min(newQuantity, maxAvailable));
  };

  const handleAdd = () => {
    onAddToPackingList(item.id, pendingQuantity);
    setPendingQuantity(1); // Reset to 1 after adding
  };

  const maxAvailable = (item.availableQuantity || 999) - alreadySelectedQuantity;
  const canAdd = !expired && maxAvailable > 0 && pendingQuantity <= maxAvailable;

  return (
    <div 
      className={`border border-border rounded-lg p-4 transition-all hover:shadow-sm ${
        expired ? 'opacity-60' : ''
      } ${alreadySelectedQuantity > 0 ? 'bg-accent/10 border-accent' : 'bg-card'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div 
            className={item.type === 'batch' && onBatchClick ? "cursor-pointer" : ""}
            onClick={item.type === 'batch' && onBatchClick ? () => onBatchClick(item) : undefined}
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
            {alreadySelectedQuantity > 0 && (
              <Badge variant="default" className="text-xs">
                In List: {alreadySelectedQuantity}
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
            onClick={() => handleQuantityChange(-1)}
            disabled={pendingQuantity <= 1 || expired}
          >
            -
          </Button>
          
          <span className="w-8 text-center font-medium">{pendingQuantity}</span>

          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => handleQuantityChange(1)}
            disabled={!canAdd || pendingQuantity >= maxAvailable}
          >
            +
          </Button>
        </div>

        <Button 
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
          className="bg-primary hover:bg-primary/90"
        >
          <Package className="w-4 h-4 mr-1" />
          Add ({pendingQuantity})
        </Button>
      </div>
    </div>
  );
}