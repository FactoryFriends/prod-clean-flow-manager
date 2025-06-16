
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useBatchMovements } from "@/hooks/useBatchMovements";

interface Movement {
  id: string;
  dispatch_type: string;
  dispatch_date: string;
  destination?: string | null;
  customer?: string | null;
  picker_name: string;
  quantity: number;
  dispatch_notes?: string;
  created_at: string;
  packing_slip_id?: string | null;
}

interface BatchMovementsTableProps {
  batchId: string;
  batchNumber: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMovementClick: (movement: Movement) => void;
}

export function BatchMovementsTable({ batchId, batchNumber, isExpanded, onToggle, onMovementClick }: BatchMovementsTableProps) {
  const { data = [], isLoading } = useBatchMovements(batchId);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 cursor-pointer">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-mono text-sm">{batchNumber}</span>
          <span className="text-sm text-muted-foreground ml-auto">
            {data.length} movement{data.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="py-6 text-center">Loading movements...</div>
          ) : data.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">No movements for this batch.</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
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
                    <TableRow 
                      key={move.id}
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => onMovementClick(move)}
                    >
                      <TableCell>{format(new Date(move.dispatch_date), "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell className="capitalize">{move.dispatch_type}</TableCell>
                      <TableCell>
                        {move.customer || move.destination || "N/A"}
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
