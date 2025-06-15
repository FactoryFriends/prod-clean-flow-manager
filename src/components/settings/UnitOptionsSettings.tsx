
import React, { useState } from "react";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Check, X } from "lucide-react";

type EditState = { type: "purchase" | "inner"; unit: string } | null;

export function UnitOptionsSettings() {
  const { 
    purchaseUnits,
    innerUnits,
    addPurchaseUnit,
    addInnerUnit,
    removePurchaseUnit,
    removeInnerUnit
  } = useUnitOptions();

  const [newPurchaseUnit, setNewPurchaseUnit] = useState("");
  const [newInnerUnit, setNewInnerUnit] = useState("");
  const [editState, setEditState] = useState<EditState>(null);
  const [editValue, setEditValue] = useState("");

  // Helper: begin editing
  const startEdit = (type: "purchase" | "inner", unit: string) => {
    setEditState({ type, unit });
    setEditValue(unit);
  };

  // Helper: save edit
  const saveEdit = () => {
    if (!editState) return;
    const newUnit = editValue.trim().toUpperCase();
    if (!newUnit || newUnit === editState.unit) {
      setEditState(null);
      return;
    }
    if (editState.type === "purchase") {
      removePurchaseUnit(editState.unit);
      addPurchaseUnit(newUnit);
    } else {
      removeInnerUnit(editState.unit);
      addInnerUnit(newUnit);
    }
    setEditState(null);
  };

  // Helper: cancel edit
  const cancelEdit = () => {
    setEditState(null);
    setEditValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Dropdown Options</CardTitle>
        <CardDescription>
          Manage selectable values for the "Purchase Unit" and "Inner Unit" drop-down lists seen elsewhere in the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 md:flex-row">
        {/* PURCHASE UNITS */}
        <div className="md:w-1/2">
          <h3 className="font-semibold mb-2">Purchase Units</h3>
          <div className="flex mb-3 gap-2">
            <Input
              size={16}
              placeholder="New unit…"
              value={newPurchaseUnit}
              onChange={e => setNewPurchaseUnit(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newPurchaseUnit.trim()) {
                  addPurchaseUnit(newPurchaseUnit.trim().toUpperCase());
                  setNewPurchaseUnit("");
                }
              }}
            />
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
          <ul className="flex flex-col gap-1">
            {purchaseUnits.map(unit => (
              <li
                key={unit}
                className="flex items-center justify-between py-1 px-2 bg-muted rounded-md group hover:bg-emerald-50"
              >
                {editState && editState.type === "purchase" && editState.unit === unit ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value.toUpperCase())}
                      className="w-32 h-8"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1"
                      onClick={saveEdit}
                      aria-label="Save"
                    >
                      <Check className="w-4 h-4 text-green-700" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1"
                      onClick={cancelEdit}
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4 text-red-700" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">{unit}</span>
                    <span className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 opacity-70 hover:opacity-100 transition"
                        onClick={() => startEdit("purchase", unit)}
                        aria-label="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 text-red-600 opacity-70 hover:opacity-100 transition"
                        onClick={() => removePurchaseUnit(unit)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* INNER UNITS */}
        <div className="md:w-1/2">
          <h3 className="font-semibold mb-2">Inner Units</h3>
          <div className="flex mb-3 gap-2">
            <Input
              size={16}
              placeholder="New inner unit…"
              value={newInnerUnit}
              onChange={e => setNewInnerUnit(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newInnerUnit.trim()) {
                  addInnerUnit(newInnerUnit.trim().toUpperCase());
                  setNewInnerUnit("");
                }
              }}
            />
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
          <ul className="flex flex-col gap-1">
            {innerUnits.map(unit => (
              <li
                key={unit}
                className="flex items-center justify-between py-1 px-2 bg-muted rounded-md group hover:bg-emerald-50"
              >
                {editState && editState.type === "inner" && editState.unit === unit ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value.toUpperCase())}
                      className="w-32 h-8"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1"
                      onClick={saveEdit}
                      aria-label="Save"
                    >
                      <Check className="w-4 h-4 text-green-700" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1"
                      onClick={cancelEdit}
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4 text-red-700" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">{unit}</span>
                    <span className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 opacity-70 hover:opacity-100 transition"
                        onClick={() => startEdit("inner", unit)}
                        aria-label="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 text-red-600 opacity-70 hover:opacity-100 transition"
                        onClick={() => removeInnerUnit(unit)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default UnitOptionsSettings;
