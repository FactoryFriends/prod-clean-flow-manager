
import React from "react";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import UnitOptionList from "./UnitOptionList";
import { LaborCostSettings } from "./LaborCostSettings";

export function UnitOptionsSettings() {
  const {
    purchaseUnits,
    innerUnits,
    addPurchaseUnit,
    addInnerUnit,
    removePurchaseUnit,
    removeInnerUnit,
  } = useUnitOptions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit Dropdown Options</CardTitle>
          <CardDescription>
            Manage selectable values for the "Purchase Unit" and "Inner Unit" drop-down lists seen elsewhere in the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 md:flex-row">
          <div className="md:w-1/2">
            <UnitOptionList
              units={purchaseUnits}
              unitType="purchase"
              addUnit={addPurchaseUnit}
              removeUnit={removePurchaseUnit}
              label="Purchase Units"
              placeholder="New unit…"
            />
          </div>
          <div className="md:w-1/2">
            <UnitOptionList
              units={innerUnits}
              unitType="inner"
              addUnit={addInnerUnit}
              removeUnit={removeInnerUnit}
              label="Inner Units"
              placeholder="New inner unit…"
            />
          </div>
        </CardContent>
      </Card>

      <LaborCostSettings />
    </div>
  );
}

export default UnitOptionsSettings;
