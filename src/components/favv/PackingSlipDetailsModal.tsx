
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { FileText, MapPin, User, Package, Calendar, Truck } from "lucide-react";

interface PackingSlip {
  id: string;
  slip_number: string;
  created_at: string;
  destination: string;
  total_items: number;
  total_packages: number;
  prepared_by?: string;
  picked_up_by?: string;
  pickup_date?: string;
  batch_ids?: string[];
  status?: string;
  dispatch_records?: {
    location?: string;
    dispatch_type?: string;
    picker_name?: string;
    customer?: string;
    dispatch_notes?: string;
  } | null;
  batches?: {
    id: string;
    batch_number: string;
    production_date: string;
    expiry_date: string;
    products: {
      name: string;
      unit_size: number;
      unit_type: string;
    };
  }[];
}

interface PackingSlipDetailsModalProps {
  packingSlip: PackingSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PackingSlipDetailsModal({ packingSlip, isOpen, onClose }: PackingSlipDetailsModalProps) {
  if (!packingSlip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Packing Slip Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
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

          {/* Location & Dispatch Info */}
          {packingSlip.dispatch_records && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dispatch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <Badge variant="outline" className="mt-1">
                      {packingSlip.dispatch_records.location?.toUpperCase() || "KHIN"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <Badge variant="outline" className="mt-1">
                      {packingSlip.dispatch_records.dispatch_type || "external"}
                    </Badge>
                  </div>
                </div>

                {packingSlip.dispatch_records.customer && (
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">{packingSlip.dispatch_records.customer}</p>
                  </div>
                )}

                {packingSlip.dispatch_records.dispatch_notes && (
                  <div>
                    <p className="text-sm font-medium">Dispatch Notes</p>
                    <p className="text-sm text-muted-foreground">{packingSlip.dispatch_records.dispatch_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Staff Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {packingSlip.prepared_by && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Prepared by</p>
                      <p className="text-sm text-muted-foreground">{packingSlip.prepared_by}</p>
                    </div>
                  </div>
                )}
                
                {(packingSlip.picked_up_by || packingSlip.dispatch_records?.picker_name) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Picked up by</p>
                      <p className="text-sm text-muted-foreground">
                        {packingSlip.dispatch_records?.picker_name || packingSlip.picked_up_by}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}

          {/* Batch Information */}
          {packingSlip.batches && packingSlip.batches.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packingSlip.batches.map((batch, index) => (
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
          ) : packingSlip.batch_ids && packingSlip.batch_ids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium mb-2">Batch IDs</p>
                  <div className="flex flex-wrap gap-2">
                    {packingSlip.batch_ids.map((batchId, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {batchId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {packingSlip.pickup_date && (
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
                      {format(new Date(packingSlip.pickup_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
