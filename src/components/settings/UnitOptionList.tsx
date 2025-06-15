
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X } from "lucide-react";

type UnitOptionListProps = {
  units: string[];
  unitType: "purchase" | "inner";
  addUnit: (unit: string) => void;
  removeUnit: (unit: string) => void;
  label: string;
  placeholder: string;
};

type EditState = string | null;

export function UnitOptionList({
  units,
  unitType,
  addUnit,
  removeUnit,
  label,
  placeholder,
}: UnitOptionListProps) {
  const [newUnit, setNewUnit] = useState("");
  const [editState, setEditState] = useState<EditState>(null);
  const [editValue, setEditValue] = useState("");

  // Helper: begin editing
  const startEdit = (unit: string) => {
    setEditState(unit);
    setEditValue(unit);
  };

  // Helper: save edit
  const saveEdit = () => {
    if (!editState) return;
    const newUnitTrimmed = editValue.trim().toUpperCase();
    if (!newUnitTrimmed || newUnitTrimmed === editState) {
      setEditState(null);
      return;
    }
    removeUnit(editState);
    addUnit(newUnitTrimmed);
    setEditState(null);
  };

  // Helper: cancel edit
  const cancelEdit = () => {
    setEditState(null);
    setEditValue("");
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="flex mb-3 gap-2">
        <Input
          size={16}
          placeholder={placeholder}
          value={newUnit}
          onChange={e => setNewUnit(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && newUnit.trim()) {
              addUnit(newUnit.trim().toUpperCase());
              setNewUnit("");
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            if (newUnit.trim()) {
              addUnit(newUnit.trim().toUpperCase());
              setNewUnit("");
            }
          }}
          variant="secondary"
        >
          Add
        </Button>
      </div>
      <ul className="flex flex-col gap-1">
        {units.map(unit => (
          <li
            key={unit}
            className="flex items-center justify-between py-1 px-2 bg-muted rounded-md group hover:bg-emerald-50"
          >
            {editState === unit ? (
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
                    onClick={() => startEdit(unit)}
                    aria-label="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 text-red-600 opacity-70 hover:opacity-100 transition"
                    onClick={() => removeUnit(unit)}
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
  );
}

export default UnitOptionList;
