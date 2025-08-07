
import React, { createContext, useContext, ReactNode } from "react";
import { usePurchaseUnits, useInnerUnits } from "@/hooks/useUnitOptions";

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

const defaultLaborCostPerMinute = 0.5; // Euro per minute

const UnitOptionsContext = createContext<UnitOptionsContextType | undefined>(undefined);

export function UnitOptionsProvider({ children }: { children: ReactNode }) {
  const purchaseUnits = usePurchaseUnits();
  const innerUnits = useInnerUnits();
  const [laborCostPerMinute, setLaborCostPerMinute] = React.useState<number>(defaultLaborCostPerMinute);

  // These functions are now legacy - unit management happens through the database
  const addPurchaseUnit = (value: string) => {
    console.warn("addPurchaseUnit is deprecated - use the Settings UI to manage units");
  };
  
  const addInnerUnit = (value: string) => {
    console.warn("addInnerUnit is deprecated - use the Settings UI to manage units");
  };
  
  const removePurchaseUnit = (value: string) => {
    console.warn("removePurchaseUnit is deprecated - use the Settings UI to manage units");
  };
  
  const removeInnerUnit = (value: string) => {
    console.warn("removeInnerUnit is deprecated - use the Settings UI to manage units");
  };
  
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
