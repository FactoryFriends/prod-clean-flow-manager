import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { InputWithKeyboard } from "./ui/input-with-keyboard";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus } from "lucide-react";
import { useProducts, useChefs, useCreateProductionBatch } from "@/hooks/useProductionData";

interface EmbeddedBatchFormProps {
  currentLocation: "tothai" | "khin";
  onBatchCreated?: (batch: any) => void;
}

export function EmbeddedBatchForm({ currentLocation, onBatchCreated }: EmbeddedBatchFormProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedChefId, setSelectedChefId] = useState("");
  const [packagesProduced, setPackagesProduced] = useState("");
  const [itemsPerPackage, setItemsPerPackage] = useState("");
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: chefs, isLoading: chefsLoading } = useChefs(currentLocation);
  const createBatch = useCreateProductionBatch();

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  // Helper function to get packaging type from product unit_type
  const getPackagingType = (product: any) => {
    if (product?.unit_type) {
      return product.unit_type.toUpperCase();
    }
    return "PACKAGES"; // fallback
  };

  // Auto-calculate expiry date when product changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.shelf_life_days) {
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + selectedProduct.shelf_life_days);
      setCalculatedExpiryDate(expiryDate.toISOString().split('T')[0]);
    } else {
      // Default to 7 days if no shelf life specified
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + 7);
      setCalculatedExpiryDate(expiryDate.toISOString().split('T')[0]);
    }
  }, [selectedProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !selectedChefId || !packagesProduced) {
      return;
    }

    const batchData: any = {
      product_id: selectedProductId,
      chef_id: selectedChefId,
      packages_produced: parseInt(packagesProduced),
      expiry_date: calculatedExpiryDate,
      production_notes: notes || undefined,
      location: currentLocation,
    };

    // Add items_per_package if variable packaging is enabled and value is provided
    if (selectedProduct?.variable_packaging && itemsPerPackage) {
      batchData.items_per_package = parseInt(itemsPerPackage);
    }

    createBatch.mutate(batchData, {
      onSuccess: (newBatch) => {
        setSelectedProductId("");
        setSelectedChefId("");
        setPackagesProduced("");
        setItemsPerPackage("");
        setNotes("");
        
        // Call the callback to open label printing
        if (onBatchCreated) {
          onBatchCreated(newBatch);
        }
      }
    });
  };

  const canSubmit = selectedProductId && selectedChefId && packagesProduced && 
    (!selectedProduct?.variable_packaging || itemsPerPackage) && !createBatch.isPending;

  return (
    <Card className="bg-blue-50 border-2 border-blue-200 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Plus className="w-5 h-5" />
          Create New Production Batch
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Optimized layout - 4 columns */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product" className="text-sm font-medium">Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.unit_size} {product.unit_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {calculatedExpiryDate && (
                <p className="text-xs text-blue-600">
                  Expires: {new Date(calculatedExpiryDate).toLocaleDateString()}
                  {selectedProduct?.shelf_life_days && ` (${selectedProduct.shelf_life_days}d shelf life)`}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="chef" className="text-sm font-medium">Chef</Label>
              <Select value={selectedChefId} onValueChange={setSelectedChefId}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Select chef" />
                </SelectTrigger>
                <SelectContent>
                  {chefs?.map((chef) => (
                    <SelectItem key={chef.id} value={chef.id}>
                      {chef.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="packages" className="text-sm font-medium">
                # {getPackagingType(selectedProduct)}
              </Label>
              <Select value={packagesProduced} onValueChange={setPackagesProduced}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-xs text-blue-600">
                  Standard: {selectedProduct.packages_per_batch}
                </p>
              )}
            </div>

            {selectedProduct?.variable_packaging && (
              <div className="space-y-1.5">
                <Label htmlFor="itemsPerPackage" className="text-sm font-medium">
                  Items/{getPackagingType(selectedProduct)?.slice(0, -1) || 'Package'}
                </Label>
                <InputWithKeyboard
                  id="itemsPerPackage"
                  type="number"
                  value={itemsPerPackage}
                  onChange={(e) => setItemsPerPackage(e.target.value)}
                  placeholder="40"
                  className="bg-white h-9"
                />
              </div>
            )}

          </div>

          {/* Compact info section */}
          {selectedProduct && (
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="text-xs text-blue-700">
                💡 You can adjust package count from standard batch size.
                {selectedProduct.unit_type === "PIECE" && 
                  " Example: 600 spring rolls ÷ 30 per bag = 20 bags"
                }
              </div>
            </div>
          )}

          {/* Bottom row - Notes and submit */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
            <div className="lg:col-span-2 space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">Production Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes..."
                rows={2}
                className="bg-white"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!canSubmit}
                className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
              >
                {createBatch.isPending ? "Creating..." : "CREATE & PRINT"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
