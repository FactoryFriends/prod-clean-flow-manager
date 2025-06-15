import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { useProducts, useChefs, useCreateProductionBatch } from "@/hooks/useProductionData";

interface NewBatchDialogProps {
  currentLocation: "tothai" | "khin";
}

export function NewBatchDialog({ currentLocation }: NewBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedChefId, setSelectedChefId] = useState("");
  const [packagesProduced, setPackagesProduced] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [notes, setNotes] = useState("");

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: chefs, isLoading: chefsLoading } = useChefs(currentLocation);
  const createBatch = useCreateProductionBatch();

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !selectedChefId || !packagesProduced) {
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

    createBatch.mutate({
      product_id: selectedProductId,
      chef_id: selectedChefId,
      packages_produced: parseInt(packagesProduced),
      expiry_date: expiryDate.toISOString().split('T')[0],
      production_notes: notes || undefined,
      location: currentLocation,
    }, {
      onSuccess: () => {
        setOpen(false);
        setSelectedProductId("");
        setSelectedChefId("");
        setPackagesProduced("");
        setExpiryDays("7");
        setNotes("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Production Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            <Label htmlFor="packages">Number of Packages Produced</Label>
            <Input
              id="packages"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={packagesProduced}
              onChange={(e) => setPackagesProduced(e.target.value)}
              placeholder="Enter number of packages"
              min="1"
            />
            {selectedProduct && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Standard batch size: {selectedProduct.packages_per_batch} packages of {selectedProduct.unit_size} {selectedProduct.unit_type}
                </p>
                <p className="text-xs italic text-blue-800">
                  Tip: You can adjust this value if you made a smaller or larger batch than usual.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry (days from today)</Label>
            <Input
              id="expiry"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              min="1"
              max="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Production Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes about this batch..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBatch.isPending}>
              {createBatch.isPending ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
