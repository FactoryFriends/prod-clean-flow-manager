
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ProductionBatch } from "@/hooks/useProductionData";
import { format } from "date-fns";
import { Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PackingSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: ProductionBatch[];
  selectedBatches?: string[];
}

export function PackingSlipDialog({ 
  open, 
  onOpenChange, 
  batches, 
  selectedBatches = [] 
}: PackingSlipDialogProps) {
  const [destination, setDestination] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [pickedUpBy, setPickedUpBy] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [checkedBatches, setCheckedBatches] = useState<string[]>(selectedBatches);
  const [creating, setCreating] = useState(false);

  const handleBatchToggle = (batchId: string) => {
    setCheckedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const generateSlipNumber = () => {
    const date = new Date();
    const dateStr = format(date, "yyyyMMdd");
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PS-${dateStr}-${randomSuffix}`;
  };

  const calculateTotals = () => {
    const selectedBatchData = batches.filter(batch => checkedBatches.includes(batch.id));
    const totalPackages = selectedBatchData.reduce((sum, batch) => sum + batch.packages_produced, 0);
    const totalItems = selectedBatchData.length;
    return { totalPackages, totalItems };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || checkedBatches.length === 0) {
      toast.error("Please provide destination and select at least one batch");
      return;
    }

    setCreating(true);
    
    try {
      const { totalPackages, totalItems } = calculateTotals();
      
      const { data, error } = await supabase
        .from("packing_slips")
        .insert({
          slip_number: generateSlipNumber(),
          destination,
          batch_ids: checkedBatches,
          prepared_by: preparedBy || null,
          picked_up_by: pickedUpBy || null,
          pickup_date: pickupDate || null,
          total_items: totalItems,
          total_packages: totalPackages
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Packing slip created successfully");
      
      // Reset form
      setDestination("");
      setPreparedBy("");
      setPickedUpBy("");
      setPickupDate("");
      setNotes("");
      setCheckedBatches([]);
      
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating packing slip:", error);
      toast.error("Failed to create packing slip");
    } finally {
      setCreating(false);
    }
  };

  const { totalPackages, totalItems } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Packing Slip
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., KHIN Takeaway"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pickup-date">Pickup Date</Label>
              <Input
                id="pickup-date"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepared-by">Prepared By</Label>
              <Input
                id="prepared-by"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Staff name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="picked-up-by">Picked Up By</Label>
              <Input
                id="picked-up-by"
                value={pickedUpBy}
                onChange={(e) => setPickedUpBy(e.target.value)}
                placeholder="Driver/courier name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Select Batches for Packing Slip *</Label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {batches.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No batches available for packing
                </p>
              ) : (
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={batch.id}
                        checked={checkedBatches.includes(batch.id)}
                        onCheckedChange={() => handleBatchToggle(batch.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={batch.id} className="text-sm font-medium cursor-pointer">
                          {batch.batch_number}
                        </label>
                        <div className="text-xs text-muted-foreground">
                          {batch.products.name} • {batch.packages_produced} packages • 
                          Expires: {format(new Date(batch.expiry_date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {checkedBatches.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total Batches: {totalItems}</div>
                <div>Total Packages: {totalPackages}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating || checkedBatches.length === 0}
              className="flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              {creating ? "Creating..." : "Create Packing Slip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
