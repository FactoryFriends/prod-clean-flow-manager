
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface Batch {
  id: string;
  batch_number: string;
  production_date: string;
  expiry_date: string;
  products: {
    name: string;
    unit_size: number;
    unit_type: string;
  };
}

interface PackingSlipBatchInfoProps {
  batches?: Batch[];
  batchIds?: string[];
}

export function PackingSlipBatchInfo({ batches, batchIds }: PackingSlipBatchInfoProps) {
  if (batches && batches.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {batch.batch_number}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {batch.products.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Production:</span> {format(new Date(batch.production_date), "MMM dd, yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Expiry:</span> {format(new Date(batch.expiry_date), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (batchIds && batchIds.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm font-medium mb-2">Batch IDs (Details not available)</p>
            <div className="flex flex-wrap gap-2">
              {batchIds.map((batchId, index) => (
                <Badge key={index} variant="outline" className="font-mono text-xs">
                  {batchId}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Full batch details could not be loaded. These are the batch IDs referenced in this packing slip.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
