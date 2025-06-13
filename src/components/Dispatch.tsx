
import { useState } from "react";
import { useProductionBatches, ProductionBatch } from "@/hooks/useProductionData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Truck, Package, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

interface DispatchProps {
  currentLocation: "tothai" | "khin";
}

interface SelectedItem {
  id: string;
  type: 'batch' | 'external';
  name: string;
  batchNumber?: string;
  availableQuantity: number;
  selectedQuantity: number;
  expiryDate?: string;
}

// Mock external products data - this would come from your database
const externalProducts = [
  { id: "ext-1", name: "Coconut Milk", availableQuantity: 24, supplier: "Thai Suppliers Ltd" },
  { id: "ext-2", name: "Basmati Rice", availableQuantity: 15, supplier: "Rice Masters" },
  { id: "ext-3", name: "Green Curry Paste", availableQuantity: 8, supplier: "Spice World" },
];

export function Dispatch({ currentLocation }: DispatchProps) {
  const [customer, setCustomer] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const { data: batches } = useProductionBatches(currentLocation);

  // Convert batches to available inventory
  const availableBatches = (batches || []).map(batch => ({
    id: batch.id,
    type: 'batch' as const,
    name: batch.products.name,
    batchNumber: batch.batch_number,
    availableQuantity: batch.packages_produced,
    selectedQuantity: 0,
    expiryDate: batch.expiry_date,
  }));

  const availableExternal = externalProducts.map(product => ({
    id: product.id,
    type: 'external' as const,
    name: product.name,
    availableQuantity: product.availableQuantity,
    selectedQuantity: 0,
  }));

  const allAvailableItems = [...availableBatches, ...availableExternal];

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = allAvailableItems.find(i => i.id === itemId);
    if (!item) return;

    const existingIndex = selectedItems.findIndex(si => si.id === itemId);
    
    if (existingIndex >= 0) {
      const newQuantity = Math.max(0, Math.min(item.availableQuantity, selectedItems[existingIndex].selectedQuantity + change));
      
      if (newQuantity === 0) {
        setSelectedItems(prev => prev.filter(si => si.id !== itemId));
      } else {
        setSelectedItems(prev => prev.map(si => 
          si.id === itemId ? { ...si, selectedQuantity: newQuantity } : si
        ));
      }
    } else if (change > 0) {
      setSelectedItems(prev => [...prev, { ...item, selectedQuantity: 1 }]);
    }
  };

  const getSelectedQuantity = (itemId: string) => {
    return selectedItems.find(si => si.id === itemId)?.selectedQuantity || 0;
  };

  const handleCreatePackingSlip = () => {
    console.log("Creating packing slip with:", {
      customer,
      preparedBy,
      dispatchNotes,
      selectedItems,
    });
    // TODO: Implement packing slip creation
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Truck className="w-6 h-6 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Dispatch Operations</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer</label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khin-restaurant">KHIN Restaurant</SelectItem>
                  <SelectItem value="tothai-restaurant">To Thai Restaurant</SelectItem>
                  <SelectItem value="external-customer">External Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prepared By</label>
              <Select value={preparedBy} onValueChange={setPreparedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logistics-manager">Logistics Manager</SelectItem>
                  <SelectItem value="warehouse-staff">Warehouse Staff</SelectItem>
                  <SelectItem value="kitchen-manager">Kitchen Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dispatch Notes</label>
              <Textarea
                placeholder="Special delivery instructions, temperature requirements, etc..."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleCreatePackingSlip}
              disabled={selectedItems.length === 0 || !customer || !preparedBy}
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              Create Packing Slip
            </Button>
          </CardContent>
        </Card>

        {/* Selected Items Summary */}
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
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={item.selectedQuantity >= item.availableQuantity}
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
      </div>

      {/* Available Inventory */}
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
                            onClick={() => handleQuantityChange(batch.id, -1)}
                            disabled={selectedQty === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{selectedQty}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(batch.id, 1)}
                            disabled={selectedQty >= batch.availableQuantity}
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
                          <p className="text-sm">Available: {product.availableQuantity}</p>
                        </div>
                        <Badge variant="outline">External</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={selectedQty === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{selectedQty}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={selectedQty >= product.availableQuantity}
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
    </div>
  );
}
