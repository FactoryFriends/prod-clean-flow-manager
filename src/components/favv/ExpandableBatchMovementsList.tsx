
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Package } from "lucide-react";
import { BatchWithStock } from "@/hooks/useBatchStock";
import { BatchMovementsTable } from "./BatchMovementsTable";

interface ExpandableBatchMovementsListProps {
  batches: BatchWithStock[];
  isLoading: boolean;
}

export function ExpandableBatchMovementsList({ batches, isLoading }: ExpandableBatchMovementsListProps) {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const handleToggle = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Stock Movements by Batch ({batches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            Loading batches...
          </div>
        ) : !batches.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No batches found for the selected criteria
          </div>
        ) : (
          <div className="space-y-1 border rounded-lg">
            {batches.map((batch) => (
              <BatchMovementsTable
                key={batch.id}
                batchId={batch.id}
                batchNumber={batch.batch_number}
                isExpanded={expandedBatch === batch.id}
                onToggle={() => handleToggle(batch.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
