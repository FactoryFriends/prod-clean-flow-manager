
import { Truck, ArrowRight, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dispatch } from "./Dispatch";

interface DistributionProps {
  currentLocation: "tothai" | "khin";
}

export function Distribution({ currentLocation }: DistributionProps) {
  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Distribution Management</h1>
          <p className="text-muted-foreground">
            Manage dispatch operations from {getLocationName(currentLocation)}
          </p>
        </div>
      </div>

      {/* External Dispatch Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </div>
            External Dispatch - Create Packing Slips
          </CardTitle>
          <p className="text-blue-600 text-sm">
            Send products to customers and restaurants with official packing slips
          </p>
        </CardHeader>
        <CardContent>
          <Dispatch currentLocation={currentLocation} dispatchType="external" />
        </CardContent>
      </Card>

      {/* Internal Use Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-green-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            Internal Kitchen Use - Log Usage
          </CardTitle>
          <p className="text-green-600 text-sm">
            Record products used internally in the kitchen (no packing slips needed)
          </p>
        </CardHeader>
        <CardContent>
          <Dispatch currentLocation={currentLocation} dispatchType="internal" />
        </CardContent>
      </Card>
    </div>
  );
}
