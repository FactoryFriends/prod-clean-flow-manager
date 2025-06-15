
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

export function UnitOptionsProvider({ children }: { children: ReactNode }) {
  const [purchaseUnits, setPurchaseUnits] = useState<string[]>(defaultPurchaseUnits);
  const [innerUnits, setInnerUnits] = useState<string[]>(defaultInnerUnits);

  const addPurchaseUnit = (value: string) => {
    setPurchaseUnits((units) =>
      units.includes(value) ? units : [...units, value.trim()]
    );
  };
  const addInnerUnit = (value: string) => {
    setInnerUnits((units) =>
      units.includes(value) ? units : [...units, value.trim()]
    );
  };
  const removePurchaseUnit = (value: string) => setPurchaseUnits((units) => units.filter((v) => v !== value));
  const removeInnerUnit = (value: string) => setInnerUnits((units) => units.filter((v) => v !== value));

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
