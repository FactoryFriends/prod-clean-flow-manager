import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, ShoppingCart, Package2 } from "lucide-react";
import { SelectedItem } from "@/types/dispatch";

interface LivePackingListProps {
  selectedItems: SelectedItem[];
  onQuantityChange: (itemId: string, change: number) => void;
}

export function LivePackingList({ selectedItems, onQuantityChange }: LivePackingListProps) {
  const totalItems = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);
  const totalPackages = selectedItems.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Packing List
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalItems} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {selectedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <Package2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Items Selected
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Browse the inventory on the left and click "Add" to build your packing list
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalPackages}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{totalItems}</div>
                  <div className="text-xs text-muted-foreground">Total Items</div>
                </div>
              </div>
            </div>

            {/* Selected Items List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-3">
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h3 className="font-medium text-card-foreground">{item.name}</h3>
                        </div>
                        {item.batchNumber && (
                          <p className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber}
                          </p>
                        )}
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
                          {item.availableQuantity && (
                            <Badge variant="outline" className="text-xs">
                              Available: {item.availableQuantity}
                            </Badge>
                          )}
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
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded text-sm min-w-[3rem] text-center">
                          {item.selectedQuantity}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => onQuantityChange(item.id, 1)}
                          disabled={item.type === 'batch' && item.availableQuantity ? item.selectedQuantity >= item.availableQuantity : false}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuantityChange(item.id, -item.selectedQuantity)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}