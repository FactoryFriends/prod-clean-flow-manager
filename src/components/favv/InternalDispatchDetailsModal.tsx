import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Package, User, MapPin, Calendar, FileText } from "lucide-react";

interface InternalDispatchDetailsModalProps {
  dispatch: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InternalDispatchDetailsModal({
  dispatch,
  isOpen,
  onClose
}: InternalDispatchDetailsModalProps) {
  if (!dispatch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Internal Dispatch Details - {dispatch.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(dispatch.created_at), "PPP 'at' p")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {dispatch.location?.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Picker
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium">{dispatch.picker_name}</p>
                <p className="text-sm text-muted-foreground">Code: {dispatch.picker_code}</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{dispatch.total_items}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{dispatch.total_packages}</p>
                  <p className="text-sm text-muted-foreground">Total Packages</p>
                </div>
                <div>
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    {dispatch.dispatch_type?.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Type</p>
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {dispatch.status?.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Details */}
          {dispatch.dispatch_items && dispatch.dispatch_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Items Picked ({dispatch.dispatch_items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Production Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispatch.dispatch_items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.batch_number || "N/A"}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.production_date 
                              ? format(new Date(item.production_date), "MMM dd, yyyy")
                              : "N/A"
                            }
                          </TableCell>
                          <TableCell>
                            {item.expiry_date 
                              ? format(new Date(item.expiry_date), "MMM dd, yyyy")
                              : "N/A"
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.item_type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {dispatch.dispatch_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{dispatch.dispatch_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}