import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { format } from "date-fns";

interface InventoryItem {
  id: string;
  type: 'batch' | 'external' | 'ingredient';
  name: string;
  batchNumber?: string;
  availableQuantity?: number;
  expiryDate?: string;
  productionDate?: string;
  chef?: { name: string };
  unitSize?: number;
  unitType?: string;
  productionNotes?: string;
  productType?: 'External Product' | 'Ingredient';
  innerUnitType?: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  alreadySelectedQuantity: number;
  onBatchClick?: (item: InventoryItem) => void;
  onAddToPackingList: (itemId: string, quantity: number) => void;
  pickerName: string;
}

export function InventoryItemCard({ 
  item, 
  alreadySelectedQuantity, 
  onBatchClick, 
  onAddToPackingList,
  pickerName
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
  const canAdd = !expired && maxAvailable > 0 && pendingQuantity <= maxAvailable && !!pickerName;

  // Display name with inner unit type for external products and ingredients
  const displayName = (item.type === 'external' || item.type === 'ingredient') && item.innerUnitType
    ? `${item.name} - number of ${item.innerUnitType.toUpperCase()}`
    : item.name;

  return (
    <div 
      className={`px-3 py-2 border-b border-border/50 transition-all hover:bg-accent/5 ${
        expired ? 'opacity-60' : ''
      } ${!pickerName ? 'opacity-50 cursor-not-allowed' : ''} ${alreadySelectedQuantity > 0 ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}
    >
      {/* Product Name - First Line */}
      <div 
        className={`font-semibold text-sm text-foreground mb-1 ${
          item.type === 'batch' && onBatchClick ? "cursor-pointer hover:text-primary" : ""
        }`}
        onClick={item.type === 'batch' && onBatchClick ? () => onBatchClick(item) : undefined}
      >
        {displayName}
      </div>

      {/* Details and Controls - Second Line */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Badge */}
          {item.type === 'batch' ? (
            <Badge variant="secondary" className="text-xs shrink-0 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              House-Made
            </Badge>
          ) : item.type === 'external' ? (
            <Badge variant="outline" className="text-xs shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
              External
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              Ingredient
            </Badge>
          )}
          
          {/* Batch Number */}
          {item.type === 'batch' && item.batchNumber && (
            <span className="text-xs font-bold text-foreground shrink-0">
              #{item.batchNumber}
            </span>
          )}

          {/* Availability */}
          <span className="text-xs text-muted-foreground">
            {item.availableQuantity || 0} available
          </span>

          {/* In List indicator */}
          {alreadySelectedQuantity > 0 && (
            <span className="text-xs text-accent font-medium">
              • {alreadySelectedQuantity} in list
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-7 h-7 p-0 text-xs"
            onClick={() => handleQuantityChange(-1)}
            disabled={pendingQuantity <= 1 || expired || !pickerName}
            title={!pickerName ? "Select staff first" : undefined}
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
            title={!pickerName ? "Select staff first" : undefined}
          >
            +
          </Button>

          <Button 
            size="sm"
            onClick={handleAdd}
            disabled={!canAdd}
            className="ml-2 h-7 px-3 text-xs"
            title={!pickerName ? "Select staff first" : undefined}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}