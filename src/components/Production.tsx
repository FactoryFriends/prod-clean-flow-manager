import { useState } from "react";
import { EmbeddedBatchForm } from "./EmbeddedBatchForm";
import { LabelPrintDialog } from "./LabelPrintDialog";
import { EditBatchDialog } from "./EditBatchDialog";
import { useProductionBatches, ProductionBatch } from "@/hooks/useProductionData";
import { Search, Filter, Printer, Edit, X } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

interface ProductionProps {
  currentLocation: "tothai" | "khin";
}

export function Production({ currentLocation }: ProductionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<ProductionBatch | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: batches, isLoading, error } = useProductionBatches(currentLocation);

  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  const handleBatchCreated = (newBatch: ProductionBatch) => {
    setSelectedBatch(newBatch);
    setLabelDialogOpen(true);
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
      const isExpiringSoon = expiryDate <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days

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

  const handleEditBatch = (batch: ProductionBatch) => {
    setEditBatch(batch);
    setEditDialogOpen(true);
  };

  const getExpiryStatus = (batch: ProductionBatch) => {
    const now = new Date();
    const expiryDate = new Date(batch.expiry_date);
    const isExpired = expiryDate <= now;
    const isExpiringSoon = expiryDate <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days

    if (isExpired) return { label: "Expired", variant: "destructive" as const, expired: true };
    if (isExpiringSoon) return { label: "Expiring Soon", variant: "secondary" as const, expired: false };
    return { label: "Fresh", variant: "default" as const, expired: false };
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
      </div>

      <EmbeddedBatchForm currentLocation={currentLocation} onBatchCreated={handleBatchCreated} />

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
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredBatches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== "all" 
                ? "No batches match your search criteria" 
                : "No production batches found. Create your first batch using the form above!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Chef</TableHead>
                  <TableHead>Packages</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const expiryStatus = getExpiryStatus(batch);
                  const now = new Date();
                  const expiryDate = new Date(batch.expiry_date);
                  const isExpiringSoon = expiryDate <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) && expiryDate > now;
                  const isExpired = expiryDate <= now;
                  
                  return (
                    <TableRow 
                      key={batch.id} 
                      className={`${
                        isExpired ? 'bg-red-50 opacity-75' : 
                        isExpiringSoon ? 'bg-red-50' : ''
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {batch.products.name}
                          {isExpired && (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`font-mono text-sm ${
                        isExpired ? 'text-red-600 line-through' : 
                        isExpiringSoon ? 'text-red-600 font-bold' : ''
                      }`}>
                        {batch.batch_number}
                      </TableCell>
                      <TableCell>{batch.chefs.name}</TableCell>
                      <TableCell>{batch.packages_produced}</TableCell>
                      <TableCell>{format(new Date(batch.production_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell className={`${
                        isExpired ? 'text-red-600 font-bold' : 
                        isExpiringSoon ? 'text-red-600 font-bold' : ''
                      }`}>
                        {format(new Date(batch.expiry_date), "MMM dd, yyyy")}
                        {isExpired && <span className="ml-2">❌</span>}
                        {isExpiringSoon && !isExpired && <span className="ml-2">⚠️</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePrintLabels(batch)}
                            className="flex items-center gap-1"
                            disabled={isExpired}
                          >
                            <Printer className="w-3 h-3" />
                            Print Labels
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBatch(batch)}
                            className="flex items-center gap-1"
                            disabled={isExpired}
                          >
                            <Edit className="w-3 h-3" />
                            Edit Batch
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <LabelPrintDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        batch={selectedBatch}
      />

      <EditBatchDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        batch={editBatch}
      />
    </div>
  );
}
