
import React, { useState } from "react";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnitOptionsSettings() {
  const { purchaseUnits, innerUnits, addPurchaseUnit, addInnerUnit, removePurchaseUnit, removeInnerUnit } = useUnitOptions();
  const [newPurchaseUnit, setNewPurchaseUnit] = useState("");
  const [newInnerUnit, setNewInnerUnit] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Dropdown Options</CardTitle>
        <CardDescription>
          Manage the selectable values for the "Purchase Unit" and "Inner Unit" drop-down lists seen elsewhere in the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 md:flex-row">
        <div>
          <h3 className="font-semibold mb-2">Purchase Units</h3>
          <div className="flex mb-2 gap-2">
            <Input size={16} placeholder="New unit…" value={newPurchaseUnit} onChange={e => setNewPurchaseUnit(e.target.value)} />
            <Button
              type="button"
              onClick={() => {
                if (newPurchaseUnit.trim()) {
                  addPurchaseUnit(newPurchaseUnit.trim().toUpperCase());
                  setNewPurchaseUnit("");
                }
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          <ul>
            {purchaseUnits.map(unit => (
              <li key={unit} className="flex items-center gap-2">
                <span>{unit}</span>
                <Button variant="ghost" size="xs" onClick={() => removePurchaseUnit(unit)}>Remove</Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Inner Units</h3>
          <div className="flex mb-2 gap-2">
            <Input size={16} placeholder="New inner unit…" value={newInnerUnit} onChange={e => setNewInnerUnit(e.target.value)} />
            <Button
              type="button"
              onClick={() => {
                if (newInnerUnit.trim()) {
                  addInnerUnit(newInnerUnit.trim().toUpperCase());
                  setNewInnerUnit("");
                }
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          <ul>
            {innerUnits.map(unit => (
              <li key={unit} className="flex items-center gap-2">
                <span>{unit}</span>
                <Button variant="ghost" size="xs" onClick={() => removeInnerUnit(unit)}>Remove</Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default UnitOptionsSettings;
