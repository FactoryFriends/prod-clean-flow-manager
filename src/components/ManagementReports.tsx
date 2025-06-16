
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { PriceEvolutionReport } from "./reports/PriceEvolutionReport";
import { BarChart3, TrendingUp } from "lucide-react";

interface ManagementReportsProps {
  currentLocation: "tothai" | "khin";
  onSectionChange?: (section: string) => void;
}

export function ManagementReports({ currentLocation, onSectionChange }: ManagementReportsProps) {
  const [activeTab, setActiveTab] = useState("price-evolution");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Management Reports
          </CardTitle>
          <CardDescription>
            Comprehensive business intelligence and management analytics
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="price-evolution" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Price Evolution
          </TabsTrigger>
          {/* Future tabs will be added here */}
        </TabsList>

        <TabsContent value="price-evolution" className="space-y-6">
          <PriceEvolutionReport currentLocation={currentLocation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
