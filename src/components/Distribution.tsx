import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Home } from "lucide-react";
import { Dispatch } from "./Dispatch";

interface DistributionProps {
  currentLocation: "tothai" | "khin";
  initialTab?: "external" | "internal";
}

export function Distribution({ currentLocation, initialTab = "external" }: DistributionProps) {
  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Distribution Management</h1>
          <p className="text-muted-foreground">
            Manage dispatch operations from {getLocationName(currentLocation)}
          </p>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16">
          <TabsTrigger value="external" className="flex items-center gap-3 h-full text-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-blue-800">External Dispatch</div>
              <div className="text-xs text-blue-600">Create packing slips</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-3 h-full text-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-green-800">Internal Kitchen</div>
              <div className="text-xs text-green-600">Log internal usage</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="external" className="mt-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">External Dispatch</h2>
              <p className="text-blue-600 text-sm">
                Send products to customers and restaurants with official packing slips
              </p>
            </div>
            <Dispatch currentLocation={currentLocation} dispatchType="external" />
          </div>
        </TabsContent>

        <TabsContent value="internal" className="mt-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Internal Kitchen Use</h2>
              <p className="text-green-600 text-sm">
                Record products used internally in the kitchen (no packing slips needed)
              </p>
            </div>
            <Dispatch currentLocation={currentLocation} dispatchType="internal" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
