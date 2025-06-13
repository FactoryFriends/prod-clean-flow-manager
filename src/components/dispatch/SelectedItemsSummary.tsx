
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { SelectedItem } from "@/types/dispatch";

interface SelectedItemsSummaryProps {
  selectedItems: SelectedItem[];
  onQuantityChange: (itemId: string, change: number) => void;
}

export function SelectedItemsSummary({ selectedItems, onQuantityChange }: SelectedItemsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Items ({selectedItems.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No items selected. Choose items from the Available Inventory below.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.batchNumber && (
                    <p className="text-sm text-muted-foreground">Batch: {item.batchNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.selectedQuantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(item.id, 1)}
                    disabled={item.type === 'batch' && item.availableQuantity ? item.selectedQuantity >= item.availableQuantity : false}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
