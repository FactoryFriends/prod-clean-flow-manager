
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FAVVReports } from "./FAVVReports";
import { ManagementReports } from "./ManagementReports";

interface ReportsProps {
  currentLocation: "tothai" | "khin";
}

export function Reports({ currentLocation }: ReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting for compliance and management oversight
          </p>
        </div>
      </div>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">Management Dashboard</TabsTrigger>
          <TabsTrigger value="favv">FAVV Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <ManagementReports currentLocation={currentLocation} />
        </TabsContent>

        <TabsContent value="favv" className="space-y-6">
          <FAVVReports currentLocation={currentLocation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
