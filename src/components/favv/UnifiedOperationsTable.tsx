import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PackingSlipDetailsModal } from "./PackingSlipDetailsModal";
import { InternalDispatchDetailsModal } from "./InternalDispatchDetailsModal";
import { UnifiedOperation } from "@/hooks/useUnifiedOperationsData";

interface UnifiedOperationsTableProps {
  operations: UnifiedOperation[];
  isLoading: boolean;
  operationType: "all" | "external" | "internal";
  onOperationTypeChange: (type: "all" | "external" | "internal") => void;
}

export function UnifiedOperationsTable({ 
  operations, 
  isLoading, 
  operationType, 
  onOperationTypeChange 
}: UnifiedOperationsTableProps) {
  const [selectedOperation, setSelectedOperation] = useState<UnifiedOperation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (operation: UnifiedOperation) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Operations Overview ({operations.length})
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onOperationTypeChange("all")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md border transition-colors",
                  operationType === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                )}
              >
                ALL
              </button>
              <button
                onClick={() => onOperationTypeChange("external")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md border transition-colors",
                  operationType === "external"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-background hover:bg-green-50 border-border hover:border-green-200"
                )}
              >
                EXT
              </button>
              <button
                onClick={() => onOperationTypeChange("internal")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md border transition-colors",
                  operationType === "internal"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-background hover:bg-orange-50 border-border hover:border-orange-200"
                )}
              >
                INT
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Loading operations...
            </div>
          ) : !operations.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No operations found for the selected criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Packages</TableHead>
                    <TableHead>Picker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow 
                      key={`${operation.type}-${operation.id}`}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50 transition-colors",
                        operation.type === "EXTERNAL" ? "hover:bg-green-50/50" : "hover:bg-orange-50/50"
                      )}
                      onClick={() => handleRowClick(operation)}
                    >
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          operation.type === "EXTERNAL" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        )}>
                          {operation.type === "EXTERNAL" ? "EXT" : "INT"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {operation.reference_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(operation.date), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {operation.location.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {operation.destination}
                      </TableCell>
                      <TableCell>{operation.total_items}</TableCell>
                      <TableCell>{operation.total_packages}</TableCell>
                      <TableCell>{operation.picker_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals for different operation types */}
      {selectedOperation?.type === "EXTERNAL" && (
        <PackingSlipDetailsModal
          packingSlip={selectedOperation.details}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      
      {selectedOperation?.type === "INTERNAL" && (
        <InternalDispatchDetailsModal
          dispatch={selectedOperation.details}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}