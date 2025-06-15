
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { useBatchMovements } from "@/hooks/useBatchMovements";

interface BatchMovementsTableProps {
  batchId: string;
  onClose: () => void;
  batchNumber: string;
}

export function BatchMovementsTable({ batchId, onClose, batchNumber }: BatchMovementsTableProps) {
  const { data = [], isLoading } = useBatchMovements(batchId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movements for Batch {batchNumber}</CardTitle>
        <button 
          onClick={onClose} 
          className="ml-auto text-sm underline text-green-800 hover:text-green-900"
        >
          Close
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">Loading movements...</div>
        ) : data.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No movements for this batch.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>All movements for this batch (internal, external, etc.)</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Destination/Customer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Picker</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell>{format(new Date(move.dispatch_date), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="capitalize">{move.dispatch_type}</TableCell>
                    <TableCell>
                      {move.customer ? move.customer : move.destination || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono">{move.quantity}</TableCell>
                    <TableCell>{move.picker_name}</TableCell>
                    <TableCell>{move.dispatch_notes || ""}</TableCell>
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
