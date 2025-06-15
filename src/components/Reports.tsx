import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FAVVReports } from "./FAVVReports";
import { ManagementReports } from "./ManagementReports";
import IngredientPriceManager from "./reports/IngredientPriceManager";

interface ReportsProps {
  currentLocation: "tothai" | "khin";
  onSectionChange?: (section: string) => void;
}

export function Reports({ currentLocation, onSectionChange }: ReportsProps) {
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">Management Dashboard</TabsTrigger>
          <TabsTrigger value="favv">FAVV Compliance</TabsTrigger>
          <TabsTrigger value="ingredient-margins">Ingredient Margins</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <ManagementReports currentLocation={currentLocation} onSectionChange={onSectionChange} />
        </TabsContent>

        <TabsContent value="favv" className="space-y-6">
          <FAVVReports currentLocation={currentLocation} />
        </TabsContent>

        <TabsContent value="ingredient-margins" className="space-y-6">
          <IngredientPriceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
