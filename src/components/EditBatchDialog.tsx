import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { useChefs, useUpdateProductionBatch, ProductionBatch } from "@/hooks/useProductionData";

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export function EditBatchDialog({ open, onOpenChange, batch }: EditBatchDialogProps) {
  const [selectedChefId, setSelectedChefId] = useState("");
  const [packagesProduced, setPackagesProduced] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: chefs } = useChefs(batch?.location);
  const updateBatch = useUpdateProductionBatch();

  // Initialize form when batch changes
  useEffect(() => {
    if (batch) {
      setSelectedChefId(batch.chef_id);
      setPackagesProduced(batch.packages_produced.toString());
      setExpiryDate(batch.expiry_date);
      setNotes(batch.production_notes || "");
    }
  }, [batch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batch || !selectedChefId || !packagesProduced) {
      return;
    }

    updateBatch.mutate({
      id: batch.id,
      chef_id: selectedChefId,
      packages_produced: parseInt(packagesProduced),
      expiry_date: expiryDate,
      production_notes: notes || undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const canSubmit = selectedChefId && packagesProduced && !updateBatch.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Production Batch</DialogTitle>
        </DialogHeader>
        
        {batch && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {batch.products.name} ({batch.products.unit_size} {batch.products.unit_type})
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <div className="p-2 bg-muted rounded text-sm font-mono">
                  {batch.batch_number}
                </div>
              </div>
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
              <Label htmlFor="packages">
                Number of Packages{batch.products.unit_type === "PIECE" ? "/Bags" : ""} Produced
              </Label>
              <Select value={packagesProduced} onValueChange={setPackagesProduced}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of packages" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {batch.products.unit_type === "PIECE" ? `bag${num > 1 ? 's' : ''}` : `package${num > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Production Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!canSubmit}
              >
                {updateBatch.isPending ? "Updating..." : "Update Batch"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}