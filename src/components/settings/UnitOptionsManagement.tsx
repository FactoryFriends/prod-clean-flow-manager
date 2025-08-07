import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useUnitOptionsQuery, useCreateUnitOption, useDeleteUnitOption } from "@/hooks/useUnitOptions";
import { LaborCostSettings } from "./LaborCostSettings";

export function UnitOptionsManagement() {
  const { data: unitOptions = [], isLoading } = useUnitOptionsQuery();
  const createUnitOption = useCreateUnitOption();
  const deleteUnitOption = useDeleteUnitOption();
  
  const [newPurchaseUnit, setNewPurchaseUnit] = useState("");
  const [newInnerUnit, setNewInnerUnit] = useState("");

  const purchaseUnits = unitOptions.filter(unit => unit.unit_type === 'purchase');
  const innerUnits = unitOptions.filter(unit => unit.unit_type === 'inner');

  const handleAddPurchaseUnit = () => {
    if (!newPurchaseUnit.trim()) return;
    createUnitOption.mutate({ 
      name: newPurchaseUnit.trim(), 
      unit_type: 'purchase' 
    });
    setNewPurchaseUnit("");
  };

  const handleAddInnerUnit = () => {
    if (!newInnerUnit.trim()) return;
    createUnitOption.mutate({ 
      name: newInnerUnit.trim(), 
      unit_type: 'inner' 
    });
    setNewInnerUnit("");
  };

  const handleDeleteUnit = (id: string) => {
    deleteUnitOption.mutate(id);
  };

  if (isLoading) {
    return <div>Loading unit options...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit Options Management</CardTitle>
          <CardDescription>
            Manage the selectable values for "Purchase Unit" and "Inner Unit" dropdowns used throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 md:flex-row">
          <div className="md:w-1/2">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Purchase Units</Label>
              <div className="flex gap-2">
                <Input
                  value={newPurchaseUnit}
                  onChange={(e) => setNewPurchaseUnit(e.target.value)}
                  placeholder="New purchase unit..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPurchaseUnit()}
                />
                <Button 
                  onClick={handleAddPurchaseUnit}
                  size="sm"
                  disabled={!newPurchaseUnit.trim() || createUnitOption.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {purchaseUnits.map((unit) => (
                  <Badge key={unit.id} variant="secondary" className="flex items-center gap-2">
                    {unit.name}
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="ml-1 hover:text-destructive"
                      disabled={deleteUnitOption.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Inner Units</Label>
              <div className="flex gap-2">
                <Input
                  value={newInnerUnit}
                  onChange={(e) => setNewInnerUnit(e.target.value)}
                  placeholder="New inner unit..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInnerUnit()}
                />
                <Button 
                  onClick={handleAddInnerUnit}
                  size="sm"
                  disabled={!newInnerUnit.trim() || createUnitOption.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {innerUnits.map((unit) => (
                  <Badge key={unit.id} variant="secondary" className="flex items-center gap-2">
                    {unit.name}
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="ml-1 hover:text-destructive"
                      disabled={deleteUnitOption.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LaborCostSettings />
    </div>
  );
}