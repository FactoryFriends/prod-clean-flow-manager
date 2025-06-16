
import React, { useState } from "react";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Euro, Clock } from "lucide-react";

export function LaborCostSettings() {
  const { laborCostPerMinute, updateLaborCostPerMinute } = useUnitOptions();
  const [tempValue, setTempValue] = useState(laborCostPerMinute.toString());

  const handleSave = () => {
    const newCost = parseFloat(tempValue);
    if (!isNaN(newCost) && newCost >= 0) {
      updateLaborCostPerMinute(newCost);
    } else {
      // Reset to current value if invalid
      setTempValue(laborCostPerMinute.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setTempValue(laborCostPerMinute.toString());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Labor Cost Settings
        </CardTitle>
        <CardDescription>
          Configure the labor cost per minute used in dish cost calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Euro className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.50"
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">per minute</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleSave}
            disabled={tempValue === laborCostPerMinute.toString()}
          >
            Save
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Current rate: €{laborCostPerMinute.toFixed(2)} per minute
        </div>
      </CardContent>
    </Card>
  );
}

export default LaborCostSettings;
