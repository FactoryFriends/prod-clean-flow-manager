
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Package, FileText, User, Calendar, MapPin, Clipboard, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "../ui/button";

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

interface MovementDetailsModalProps {
  movement: Movement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovementDetailsModal({ movement, isOpen, onClose }: MovementDetailsModalProps) {
  const { data: customers = [] } = useCustomers();
  
  if (!movement) return null;

  const isExternal = movement.dispatch_type === "external";
  
  // Find customer name if this is an external dispatch
  const getCustomerName = () => {
    if (!isExternal || !movement.customer) return movement.destination || "External Customer";
    
    const customer = customers.find(c => c.id === movement.customer);
    return customer ? customer.name : movement.customer;
  };

  const handleViewPackingSlip = () => {
    // TODO: Implement navigation to packing slip details
    console.log("Navigate to packing slip:", movement.packing_slip_id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExternal ? <FileText className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            {isExternal ? "External Dispatch Details" : "Internal Movement Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dispatch Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dispatch Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="font-medium capitalize">{movement.dispatch_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                  <p className="font-mono text-lg">{movement.quantity}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Dispatch Date
                  </label>
                  <p>{format(new Date(movement.dispatch_date), "PPP 'at' pp")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Picker
                  </label>
                  <p>{movement.picker_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination/Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {isExternal ? "Customer" : "Internal Destination"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {isExternal ? "Customer" : "Location"}
                </label>
                <p className="font-medium">{getCustomerName()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Packing Slip Reference */}
          {movement.packing_slip_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Packing Slip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <p className="font-mono text-sm">{movement.packing_slip_id}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewPackingSlip}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Archived Packing Slip
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {movement.dispatch_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clipboard className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{movement.dispatch_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Movement ID</label>
                <p className="font-mono text-sm">{movement.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p>{format(new Date(movement.created_at), "PPP 'at' pp")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
