
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { BatchWithStock } from "@/hooks/useBatchStock";

interface BatchesInStockTableProps {
  batches: BatchWithStock[];
  isLoading: boolean;
  onBatchClick?: (batch: BatchWithStock) => void;
  filterType?: 'all' | 'in-stock' | 'used';
}

export function BatchesInStockTable({ batches, isLoading, onBatchClick }: BatchesInStockTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Production Batches ({batches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            Loading batches...
          </div>
        ) : !batches.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No production batches found for the selected criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Packages Produced</TableHead>
                  <TableHead>Packages In Stock</TableHead>
                  <TableHead>Chef</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const isExpired = new Date(batch.expiry_date) < new Date(new Date().toISOString().split('T')[0]);
                  return (
                  <TableRow key={batch.id} onClick={() => onBatchClick?.(batch)} className={`cursor-pointer ${isExpired ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-green-50'}`}>
                    <TableCell className="font-mono text-sm">
                      {batch.batch_number}
                      {isExpired && <span className="ml-2 text-xs text-red-600 font-semibold">EXPIRED</span>}
                    </TableCell>
                    <TableCell>
                      {format(new Date(batch.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{batch.products?.name || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(batch.production_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(batch.expiry_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {batch.packages_produced} {batch.products?.unit_type || 'pkg'}
                      {batch.products?.unit_size && batch.products?.inner_unit_type && (
                        <div className="text-xs text-muted-foreground">
                          ({batch.packages_produced * batch.products.unit_size} {batch.products.inner_unit_type})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={
                      batch.packages_in_stock > 0 
                        ? "text-green-700 font-semibold" 
                        : "text-muted-foreground"
                    }>
                      {batch.packages_in_stock} {batch.products?.unit_type || 'pkg'}
                      {batch.products?.unit_size && batch.products?.inner_unit_type && (
                        <div className="text-xs text-muted-foreground">
                          ({batch.packages_in_stock * batch.products.unit_size} {batch.products.inner_unit_type})
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{batch.chefs?.name || "N/A"}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

