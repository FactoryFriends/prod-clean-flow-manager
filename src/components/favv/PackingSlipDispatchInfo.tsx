
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface PackingSlipDispatchInfoProps {
  dispatchRecords: {
    location?: string;
    dispatch_type?: string;
    customer?: string;
    dispatch_notes?: string;
  } | null;
}

export function PackingSlipDispatchInfo({ dispatchRecords }: PackingSlipDispatchInfoProps) {
  if (!dispatchRecords) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dispatch Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Location</p>
            <Badge variant="outline" className="mt-1">
              {dispatchRecords.location?.toUpperCase() || "KHIN"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Type</p>
            <Badge variant="outline" className="mt-1">
              {dispatchRecords.dispatch_type || "external"}
            </Badge>
          </div>
        </div>

        {dispatchRecords.customer && (
          <div>
            <p className="text-sm font-medium">Customer</p>
            <p className="text-sm text-muted-foreground">{dispatchRecords.customer}</p>
          </div>
        )}

        {dispatchRecords.dispatch_notes && (
          <div>
            <p className="text-sm font-medium">Dispatch Notes</p>
            <p className="text-sm text-muted-foreground">{dispatchRecords.dispatch_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
