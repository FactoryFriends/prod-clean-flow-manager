
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Package, Truck } from "lucide-react";

interface PackingSlipHeaderProps {
  packingSlip: {
    slip_number: string;
    created_at: string;
    destination: string;
    total_items: number;
    total_packages: number;
    status?: string;
  };
}

export function PackingSlipHeader({ packingSlip }: PackingSlipHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {packingSlip.slip_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(packingSlip.created_at), "MMM dd, yyyy HH:mm")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Destination</p>
              <p className="text-sm text-muted-foreground">{packingSlip.destination}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Items / Packages</p>
              <p className="text-sm text-muted-foreground">
                {packingSlip.total_items} items / {packingSlip.total_packages} packages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={packingSlip.status === "shipped" ? "default" : "secondary"}>
                {packingSlip.status || "draft"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
