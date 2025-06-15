
import React, { createContext, useContext, useState, ReactNode } from "react";

export type UnitOptionsContextType = {
  purchaseUnits: string[];
  innerUnits: string[];
  addPurchaseUnit: (value: string) => void;
  addInnerUnit: (value: string) => void;
  removePurchaseUnit: (value: string) => void;
  removeInnerUnit: (value: string) => void;
};

const defaultPurchaseUnits = ["CASE", "BOX", "BAG"];
const defaultInnerUnits = ["BOTTLE", "LITER", "CAN", "PIECE"];

const UnitOptionsContext = createContext<UnitOptionsContextType | undefined>(undefined);

function toUpperTrim(value: string) {
  return (value ?? "").trim().toUpperCase();
}

export function UnitOptionsProvider({ children }: { children: ReactNode }) {
  const [purchaseUnits, setPurchaseUnits] = useState<string[]>(defaultPurchaseUnits);
  const [innerUnits, setInnerUnits] = useState<string[]>(defaultInnerUnits);

  const addPurchaseUnit = (value: string) => {
    const normalized = toUpperTrim(value);
    if (!normalized) return;
    setPurchaseUnits((units) =>
      units.map(u => toUpperTrim(u)).includes(normalized) ? units : [...units, normalized]
    );
  };
  const addInnerUnit = (value: string) => {
    const normalized = toUpperTrim(value);
    if (!normalized) return;
    setInnerUnits((units) =>
      units.map(u => toUpperTrim(u)).includes(normalized) ? units : [...units, normalized]
    );
  };
  const removePurchaseUnit = (value: string) => setPurchaseUnits((units) =>
    units.filter((v) => toUpperTrim(v) !== toUpperTrim(value))
  );
  const removeInnerUnit = (value: string) => setInnerUnits((units) =>
    units.filter((v) => toUpperTrim(v) !== toUpperTrim(value))
  );

  return (
    <UnitOptionsContext.Provider
      value={{ purchaseUnits, innerUnits, addPurchaseUnit, addInnerUnit, removePurchaseUnit, removeInnerUnit }}
    >
      {children}
    </UnitOptionsContext.Provider>
  );
}

export function useUnitOptions() {
  const ctx = useContext(UnitOptionsContext);
  if (!ctx) throw new Error("useUnitOptions must be used within UnitOptionsProvider");
  return ctx;
}
