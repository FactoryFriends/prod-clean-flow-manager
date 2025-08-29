import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Home } from "lucide-react";
import { Dispatch } from "./Dispatch";
import { useState } from "react";

interface DistributionProps {
  currentLocation: "tothai" | "khin";
  initialTab?: "external" | "internal";
}

export function Distribution({ currentLocation, initialTab = "external" }: DistributionProps) {
  const [activeTab, setActiveTab] = useState<"external" | "internal">(initialTab);

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "external" | "internal")} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setActiveTab("external")}
            className={`relative overflow-hidden rounded-xl border-3 p-6 transition-all duration-200 hover:scale-[1.02] ${
              activeTab === "external"
                ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                activeTab === "external" ? "bg-white/20" : "bg-blue-200"
              }`}>
                <Truck className={`w-8 h-8 ${
                  activeTab === "external" ? "text-white" : "text-blue-600"
                }`} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Ship to Customers</h3>
                <p className={`text-sm ${
                  activeTab === "external" ? "text-blue-100" : "text-blue-600"
                }`}>
                  Create official packing slips for external delivery
                </p>
              </div>
            </div>
            {activeTab === "external" && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("internal")}
            className={`relative overflow-hidden rounded-xl border-3 p-6 transition-all duration-200 hover:scale-[1.02] ${
              activeTab === "internal"
                ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/25"
                : "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                activeTab === "internal" ? "bg-white/20" : "bg-green-200"
              }`}>
                <Home className={`w-8 h-8 ${
                  activeTab === "internal" ? "text-white" : "text-green-600"
                }`} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Use in Kitchen</h3>
                <p className={`text-sm ${
                  activeTab === "internal" ? "text-green-100" : "text-green-600"
                }`}>
                  Log products used internally (no packing slips)
                </p>
              </div>
            </div>
            {activeTab === "internal" && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>

        {/* Hidden tabs for functionality */}
        <div className="hidden">
          <TabsList>
            <TabsTrigger value="external">External</TabsTrigger>
            <TabsTrigger value="internal">Internal</TabsTrigger>
          </TabsList>
        </div>

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
