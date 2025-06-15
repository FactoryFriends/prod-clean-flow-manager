import { useState, useEffect } from "react";
import { Input } from "./ui/input";
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
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: chefs, isLoading: chefsLoading } = useChefs(currentLocation);
  const createBatch = useCreateProductionBatch();

  const selectedProduct = products?.find(p => p.id === selectedProductId);

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

    createBatch.mutate({
      product_id: selectedProductId,
      chef_id: selectedChefId,
      packages_produced: parseInt(packagesProduced),
      expiry_date: calculatedExpiryDate,
      production_notes: notes || undefined,
      location: currentLocation,
    }, {
      onSuccess: (newBatch) => {
        setSelectedProductId("");
        setSelectedChefId("");
        setPackagesProduced("");
        setNotes("");
        
        // Call the callback to open label printing
        if (onBatchCreated) {
          onBatchCreated(newBatch);
        }
      }
    });
  };

  const canSubmit = selectedProductId && selectedChefId && packagesProduced && !createBatch.isPending;

  return (
    <Card className="bg-blue-50 border-2 border-blue-200 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Plus className="w-5 h-5" />
          Create New Production Batch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.unit_size} {product.unit_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chef">Chef</Label>
            <Select value={selectedChefId} onValueChange={setSelectedChefId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a chef" />
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

          <div className="space-y-2">
            <Label htmlFor="packages">Number of Packages</Label>
            <Input
              id="packages"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={packagesProduced}
              onChange={(e) => setPackagesProduced(e.target.value)}
              placeholder="Enter packages"
              min="1"
              className="bg-white"
            />
            {selectedProduct && (
              <>
                <p className="text-xs text-blue-600">
                  Standard: {selectedProduct.packages_per_batch} packages
                </p>
                <p className="text-xs italic text-blue-800">
                  You can change this if you produced more or less than the usual batch.
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date (Auto-calculated)</Label>
            <Input
              id="expiry"
              type="date"
              value={calculatedExpiryDate}
              onChange={(e) => setCalculatedExpiryDate(e.target.value)}
              className="bg-white"
            />
            {selectedProduct && selectedProduct.shelf_life_days && (
              <p className="text-xs text-blue-600">
                Based on {selectedProduct.shelf_life_days} days shelf life
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Production Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes..."
              rows={2}
              className="bg-white"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createBatch.isPending ? "Creating..." : "CREATE BATCH AND PRINT LABELS"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
