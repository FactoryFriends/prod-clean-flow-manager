
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface PackingSlipPickupInfoProps {
  pickupDate?: string;
}

export function PackingSlipPickupInfo({ pickupDate }: PackingSlipPickupInfoProps) {
  if (!pickupDate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pickup Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Pickup Date</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(pickupDate), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
