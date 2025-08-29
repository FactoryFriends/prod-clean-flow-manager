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
    setPendingQuantity(1);
  };

  const maxAvailable = (item.availableQuantity || 999) - alreadySelectedQuantity;
  const canAdd = !expired && maxAvailable > 0 && pendingQuantity <= maxAvailable;

  return (
    <div 
      className={`flex items-center gap-3 px-3 py-2 border-b border-border/50 transition-all hover:bg-accent/5 ${
        expired ? 'opacity-60' : ''
      } ${alreadySelectedQuantity > 0 ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}
    >
      {/* Badge and Batch Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {item.type === 'batch' ? (
          <Badge variant="secondary" className="text-xs shrink-0 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            In-House
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            External
          </Badge>
        )}
        
        <div 
          className={`flex items-center gap-2 min-w-0 flex-1 ${
            item.type === 'batch' && onBatchClick ? "cursor-pointer hover:text-primary" : ""
          }`}
          onClick={item.type === 'batch' && onBatchClick ? () => onBatchClick(item) : undefined}
        >
          {item.type === 'batch' && item.batchNumber && (
            <span className="font-semibold text-sm text-foreground shrink-0">
              #{item.batchNumber}
            </span>
          )}
          <span className="text-sm text-foreground truncate" title={item.name}>
            {item.name}
          </span>
        </div>
      </div>

      {/* Availability */}
      <div className="text-right shrink-0">
        <div className="text-sm font-medium text-foreground">
          {item.availableQuantity || 0} available
        </div>
        {alreadySelectedQuantity > 0 && (
          <div className="text-xs text-accent">
            {alreadySelectedQuantity} in list
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="w-7 h-7 p-0 text-xs"
          onClick={() => handleQuantityChange(-1)}
          disabled={pendingQuantity <= 1 || expired}
        >
          -
        </Button>
        
        <span className="w-6 text-center text-xs font-medium">{pendingQuantity}</span>

        <Button
          variant="outline"
          size="sm"
          className="w-7 h-7 p-0 text-xs"
          onClick={() => handleQuantityChange(1)}
          disabled={!canAdd || pendingQuantity >= maxAvailable}
        >
          +
        </Button>

        <Button 
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
          className="ml-2 h-7 px-3 text-xs"
        >
          Add
        </Button>
      </div>
    </div>
  );
}