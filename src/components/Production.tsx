
import { useState } from "react";
import { NewBatchDialog } from "./NewBatchDialog";
import { BatchCard } from "./BatchCard";
import { LabelPrintDialog } from "./LabelPrintDialog";
import { PackingSlipDialog } from "./PackingSlipDialog";
import { useProductionBatches, ProductionBatch } from "@/hooks/useProductionData";
import { Search, Filter, Package } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ProductionProps {
  currentLocation: "tothai" | "khin";
}

export function Production({ currentLocation }: ProductionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [packingSlipDialogOpen, setPackingSlipDialogOpen] = useState(false);

  const { data: batches, isLoading, error } = useProductionBatches(currentLocation);

  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  const filterBatches = (batches: ProductionBatch[]) => {
    if (!batches) return [];

    return batches.filter((batch) => {
      const matchesSearch = 
        batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.chefs.name.toLowerCase().includes(searchTerm.toLowerCase());

      const now = new Date();
      const expiryDate = new Date(batch.expiry_date);
      const isExpired = expiryDate <= now;
      const isExpiringSoon = expiryDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      let matchesFilter = true;
      if (filterStatus === "fresh") {
        matchesFilter = !isExpired && !isExpiringSoon;
      } else if (filterStatus === "expiring") {
        matchesFilter = isExpiringSoon && !isExpired;
      } else if (filterStatus === "expired") {
        matchesFilter = isExpired;
      }

      return matchesSearch && matchesFilter;
    });
  };

  const handlePrintLabels = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setLabelDialogOpen(true);
  };

  const handleCreatePackingSlip = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setPackingSlipDialogOpen(true);
  };

  const handleCreateBulkPackingSlip = () => {
    setPackingSlipDialogOpen(true);
  };

  const filteredBatches = filterBatches(batches || []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Production Management</h1>
            <p className="text-muted-foreground">
              Manage production batches at {getLocationName(currentLocation)}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load production data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Management</h1>
          <p className="text-muted-foreground">
            Manage production batches at {getLocationName(currentLocation)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCreateBulkPackingSlip}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Create Packing Slip
          </Button>
          <NewBatchDialog currentLocation={currentLocation} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search batches, products, or chefs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="fresh">Fresh</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== "all" 
                ? "No batches match your search criteria" 
                : "No production batches found. Create your first batch to get started!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onPrintLabels={handlePrintLabels}
              onCreatePackingSlip={handleCreatePackingSlip}
            />
          ))}
        </div>
      )}

      <LabelPrintDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        batch={selectedBatch}
      />

      <PackingSlipDialog
        open={packingSlipDialogOpen}
        onOpenChange={setPackingSlipDialogOpen}
        batches={filteredBatches}
        selectedBatches={selectedBatch ? [selectedBatch.id] : []}
      />
    </div>
  );
}
