
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, ArrowRight, Home } from "lucide-react";
import { DispatchType } from "@/types/dispatch";

interface DispatchHeaderProps {
  dispatchType: DispatchType;
  onDispatchTypeChange: (type: DispatchType) => void;
}

export function DispatchHeader({ dispatchType, onDispatchTypeChange }: DispatchHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Truck className="w-6 h-6 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Dispatch Operations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={dispatchType === "external" ? "default" : "outline"}
              onClick={() => onDispatchTypeChange("external")}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              External Dispatch
            </Button>
            <Button
              variant={dispatchType === "internal" ? "default" : "outline"}
              onClick={() => onDispatchTypeChange("internal")}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Internal Use
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {dispatchType === "external" 
              ? "Create packing slips for external customers and restaurants"
              : "Log internal kitchen usage without creating packing slips or invoices"
            }
          </p>
        </CardContent>
      </Card>
    </>
  );
}
