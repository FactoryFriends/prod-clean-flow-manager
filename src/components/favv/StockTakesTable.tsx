
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Package } from "lucide-react";
import { format } from "date-fns";

interface StockTake {
  id: string;
  batch_number: string;
  created_at: string;
  production_date: string;
  expiry_date: string;
  packages_produced: number;
  products?: {
    name?: string;
  } | null;
  chefs?: {
    name?: string;
  } | null;
}

interface StockTakesTableProps {
  stockTakes: StockTake[];
  isLoading: boolean;
}

export function StockTakesTable({ stockTakes, isLoading }: StockTakesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Stock Takes ({stockTakes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            Loading stock takes...
          </div>
        ) : !stockTakes.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No stock takes found for the selected criteria
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
                  <TableHead>Packages</TableHead>
                  <TableHead>Chef</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockTakes.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-sm">
                      {batch.batch_number}
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
                    <TableCell>{batch.packages_produced}</TableCell>
                    <TableCell>{batch.chefs?.name || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
