import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConfirmInternalDispatch } from "@/hooks/useConfirmInternalDispatch";
import { useInternalDispatchRecords } from "@/hooks/useInternalDispatchRecords";
import { format } from "date-fns";
import { Package, Clock, User, MapPin } from "lucide-react";

interface InternalDispatchConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation: "tothai" | "khin";
}

export function InternalDispatchConfirmationDialog({
  open,
  onOpenChange,
  currentLocation,
}: InternalDispatchConfirmationDialogProps) {
  const { data: pendingDispatches = [] } = useInternalDispatchRecords(currentLocation);
  const confirmDispatch = useConfirmInternalDispatch();

  const handleConfirmPickup = async (dispatchId: string, pickerName: string) => {
    try {
      await confirmDispatch.mutateAsync({
        dispatchId,
        confirmedBy: pickerName,
      });
    } catch (error) {
      console.error("Error confirming pickup:", error);
    }
  };

  const getLocationName = (location: string) => {
    return location === "tothai" ? "Tothai Kitchen" : "Khin Restaurant";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Internal Kitchen Picks - {getLocationName(currentLocation)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pendingDispatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending internal picks</p>
              <p className="text-sm">All internal kitchen picks have been confirmed</p>
            </div>
          ) : (
            pendingDispatches.map((dispatch) => (
              <Card key={dispatch.id} className="border-l-4 border-l-warning">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Internal Pick #{dispatch.id.slice(-8)}
                    </CardTitle>
                    <Badge variant="outline" className="bg-warning/10">
                      Awaiting Pickup
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{dispatch.picker_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(dispatch.created_at), "MMM d, HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocationName(dispatch.location)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{dispatch.total_items} items</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {dispatch.dispatch_notes && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm"><strong>Notes:</strong> {dispatch.dispatch_notes}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Items to be picked up:</h4>
                    {dispatch.dispatch_items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          {item.batch_number && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Batch: {item.batch_number})
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {item.quantity} units
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between">
                    <Button
                      onClick={() => handleConfirmPickup(dispatch.id, dispatch.picker_name)}
                      disabled={confirmDispatch.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {confirmDispatch.isPending ? "Confirming..." : "CONFIRM PICKUP"}
                    </Button>
                    <Button
                      onClick={() => onOpenChange(false)}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      CANCEL PICKUP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}