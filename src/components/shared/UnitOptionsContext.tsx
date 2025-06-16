
import React, { createContext, useContext, useState, ReactNode } from "react";

export type UnitOptionsContextType = {
  purchaseUnits: string[];
  innerUnits: string[];
  laborCostPerMinute: number;
  addPurchaseUnit: (value: string) => void;
  addInnerUnit: (value: string) => void;
  removePurchaseUnit: (value: string) => void;
  removeInnerUnit: (value: string) => void;
  updateLaborCostPerMinute: (cost: number) => void;
};

const defaultPurchaseUnits = ["CASE", "BOX", "BAG"];
const defaultInnerUnits = ["BOTTLE", "LITER", "CAN", "PIECE"];
const defaultLaborCostPerMinute = 0.5; // Euro per minute

const UnitOptionsContext = createContext<UnitOptionsContextType | undefined>(undefined);

function toUpperTrim(value: string) {
  return (value ?? "").trim().toUpperCase();
}

export function UnitOptionsProvider({ children }: { children: ReactNode }) {
  const [purchaseUnits, setPurchaseUnits] = useState<string[]>(defaultPurchaseUnits);
  const [innerUnits, setInnerUnits] = useState<string[]>(defaultInnerUnits);
  const [laborCostPerMinute, setLaborCostPerMinute] = useState<number>(defaultLaborCostPerMinute);

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
  const updateLaborCostPerMinute = (cost: number) => setLaborCostPerMinute(cost);

  return (
    <UnitOptionsContext.Provider
      value={{ 
        purchaseUnits, 
        innerUnits, 
        laborCostPerMinute,
        addPurchaseUnit, 
        addInnerUnit, 
        removePurchaseUnit, 
        removeInnerUnit,
        updateLaborCostPerMinute
      }}
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
