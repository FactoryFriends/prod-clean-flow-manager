import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { useChefs, useUpdateProductionBatch, ProductionBatch } from "@/hooks/useProductionData";
import { useStockAdjustment } from "@/hooks/useStockAdjustment";
import { useIsAdmin } from "./auth/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { isAfter, parseISO } from "date-fns";

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export function EditBatchDialog({ open, onOpenChange, batch }: EditBatchDialogProps) {
  const [selectedChefId, setSelectedChefId] = useState("");
  const [packagesProduced, setPackagesProduced] = useState("");
  const [remainingStock, setRemainingStock] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [currentRemainingStock, setCurrentRemainingStock] = useState(0);

  const { data: chefs } = useChefs(batch?.location);
  const updateBatch = useUpdateProductionBatch();
  const stockAdjustment = useStockAdjustment();
  const isAdmin = useIsAdmin();

  // Initialize form when batch changes
  useEffect(() => {
    if (batch) {
      setSelectedChefId(batch.chef_id);
      setPackagesProduced(batch.packages_produced.toString());
      setExpiryDate(batch.expiry_date);
      setNotes(batch.production_notes || "");
      
      // Calculate current remaining stock for admins
      if (isAdmin) {
        fetchCurrentRemainingStock();
      }
    }
  }, [batch, isAdmin]);

  const fetchCurrentRemainingStock = async () => {
    if (!batch) return;
    
    const { data, error } = await supabase.rpc('get_batch_remaining_stock', { 
      batch_id_param: batch.id 
    });
    
    if (!error && data !== null) {
      setCurrentRemainingStock(data);
      setRemainingStock(data.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batch || !selectedChefId) {
      return;
    }

    // Handle admin stock adjustment
    if (isAdmin && remainingStock && parseInt(remainingStock) !== currentRemainingStock) {
      if (!adjustmentReason.trim()) {
        return; // Reason is required for stock adjustments
      }
      
      stockAdjustment.mutate({
        batchId: batch.id,
        newRemainingStock: parseInt(remainingStock),
        reason: adjustmentReason,
        adjustedBy: "Current User", // This should be replaced with actual user name
      }, {
        onSuccess: () => {
          // Also update other batch details if changed
          if (expiryDate !== batch.expiry_date || notes !== (batch.production_notes || "")) {
            updateBatch.mutate({
              id: batch.id,
              chef_id: selectedChefId,
              packages_produced: batch.packages_produced, // Keep original
              expiry_date: expiryDate,
              production_notes: notes || undefined,
            }, {
              onSuccess: () => onOpenChange(false),
            });
          } else {
            onOpenChange(false);
          }
        },
      });
    } else {
      // Regular batch update for non-admins or no stock change
      const packagesToUpdate = batch.packages_produced;
      
      updateBatch.mutate({
        id: batch.id,
        chef_id: selectedChefId,
        packages_produced: packagesToUpdate,
        expiry_date: expiryDate,
        production_notes: notes || undefined,
      }, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  const canSubmit = selectedChefId && 
    !updateBatch.isPending && 
    !stockAdjustment.isPending &&
    (isAdmin && remainingStock && parseInt(remainingStock) !== currentRemainingStock ? adjustmentReason.trim() : true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Production Batch</DialogTitle>
        </DialogHeader>
        
        {batch && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAfter(new Date(), parseISO(batch.expiry_date)) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This batch is expired. Only adjust stock for inventory corrections or waste tracking.
                </AlertDescription>
              </Alert>
            )}
            
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

            {isAdmin ? (
              <div className="space-y-2">
                <Label htmlFor="remainingStock">
                  Remaining Stock Quantity
                </Label>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Original Production: {batch.packages_produced} packages
                  </div>
                  <Input
                    id="remainingStock"
                    type="number"
                    min="0"
                    value={remainingStock}
                    onChange={(e) => setRemainingStock(e.target.value)}
                    placeholder="Enter current stock quantity"
                  />
                  {remainingStock && parseInt(remainingStock) !== currentRemainingStock && (
                    <div className="space-y-2">
                      <Label htmlFor="adjustmentReason">
                        Reason for Stock Adjustment (Required)
                      </Label>
                      <Input
                        id="adjustmentReason"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="Enter reason for adjustment..."
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Packages Produced</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {batch.packages_produced} packages
                </div>
              </div>
            )}

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
                {(updateBatch.isPending || stockAdjustment.isPending) ? "Updating..." : "Update Batch"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}