import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, User, CheckCircle, XCircle } from "lucide-react";
import { SelectedItem } from "@/types/dispatch";
import { useConfirmInternalDispatch } from "@/hooks/useConfirmInternalDispatch";

interface InternalDispatchSummaryProps {
  selectedItems: SelectedItem[];
  pickerName: string;
  currentLocation: "tothai" | "khin";
  dispatchId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InternalDispatchSummary({
  selectedItems,
  pickerName,
  currentLocation,
  dispatchId,
  onConfirm,
  onCancel
}: InternalDispatchSummaryProps) {
  const confirmMutation = useConfirmInternalDispatch();

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({ 
        dispatchId, 
        confirmedBy: pickerName 
      });
      onConfirm();
    } catch (error) {
      console.error("Failed to confirm internal dispatch:", error);
    }
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Internal Pick Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Picker</div>
                <div className="font-medium">{pickerName}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium capitalize">{currentLocation}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="font-medium">{totalItems}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items to Pick</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Production Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.type === 'batch' ? 'Batch' : 
                       item.type === 'external' ? 'External' : 'Ingredient'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.batchNumber || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.selectedQuantity}
                  </TableCell>
                  <TableCell>
                    {item.productionDate ? 
                      new Date(item.productionDate).toLocaleDateString() : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancel Pick
        </Button>
        
        <Button 
          size="lg" 
          onClick={handleConfirm}
          disabled={confirmMutation.isPending}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {confirmMutation.isPending ? "Confirming..." : "Confirm Pickup"}
        </Button>
      </div>
    </div>
  );
}