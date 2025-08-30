import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package, Box, Layers } from "lucide-react";
import { useUnitOptionsQuery, useCreateUnitOption, useDeleteUnitOption } from "@/hooks/useUnitOptions";
import { LaborCostSettings } from "./LaborCostSettings";

export function UnitOptionsManagement() {
  const { data: unitOptions = [], isLoading } = useUnitOptionsQuery();
  const createUnitOption = useCreateUnitOption();
  const deleteUnitOption = useDeleteUnitOption();
  
  const [newPurchaseUnit, setNewPurchaseUnit] = useState("");
  const [newInnerUnit, setNewInnerUnit] = useState("");
  const [newSupplierPackageUnit, setNewSupplierPackageUnit] = useState("");

  const purchaseUnits = unitOptions.filter(unit => unit.unit_type === 'purchase');
  const innerUnits = unitOptions.filter(unit => unit.unit_type === 'inner');
  const supplierPackageUnits = unitOptions.filter(unit => unit.unit_type === 'supplier_package');

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

  const handleAddSupplierPackageUnit = () => {
    if (!newSupplierPackageUnit.trim()) return;
    createUnitOption.mutate({ 
      name: newSupplierPackageUnit.trim(), 
      unit_type: 'supplier_package' 
    });
    setNewSupplierPackageUnit("");
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
          <CardTitle>Unit Management</CardTitle>
          <CardDescription>
            Manage unit options for different contexts: what suppliers sell, how you package production, and individual measurement units.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Supplier Package Units */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-semibold text-orange-900">Supplier Package Units</Label>
            </div>
            <p className="text-sm text-orange-700 mb-4">
              What suppliers sell their products in. Examples: BOX, CASE, BAG, PALLET
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newSupplierPackageUnit}
                onChange={(e) => setNewSupplierPackageUnit(e.target.value)}
                placeholder="New supplier package unit..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSupplierPackageUnit()}
              />
              <Button 
                onClick={handleAddSupplierPackageUnit}
                size="sm"
                disabled={!newSupplierPackageUnit.trim() || createUnitOption.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {supplierPackageUnits.map((unit) => (
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

          {/* Measurement Units */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Box className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-semibold text-blue-900">Measurement Units</Label>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Standard measurement units for quantities and weights. Examples: KG, LITER, METER, GRAM
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newPurchaseUnit}
                onChange={(e) => setNewPurchaseUnit(e.target.value)}
                placeholder="New measurement unit..."
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
          
          {/* Individual Unit Types */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-green-600" />
              <Label className="text-lg font-semibold text-green-900">Individual Unit Types</Label>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Individual measurement units used in recipes and production. Examples: PIECE, GRAM, ML, SLICE
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newInnerUnit}
                onChange={(e) => setNewInnerUnit(e.target.value)}
                placeholder="New individual unit..."
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
        </CardContent>
      </Card>

      {/* Live Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            Test your unit combinations to see how they work together in the product creation flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-4">Example Product Scenario:</h4>
            <div className="space-y-4">
              <p className="text-base text-gray-800 leading-relaxed">
                This product comes in{" "}
                <select className="inline border-b-2 border-blue-300 bg-transparent px-2 py-1 text-blue-600 font-semibold focus:border-blue-500 focus:outline-none">
                  <option value="">Choose...</option>
                  {supplierPackageUnits.map((unit) => (
                    <option key={unit.id} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                {" "}that contain{" "}
                <input 
                  type="number" 
                  placeholder="24" 
                  className="inline w-16 border-b-2 border-blue-300 bg-transparent px-1 py-0 text-blue-600 font-semibold focus:border-blue-500 border-t-0 border-l-0 border-r-0 rounded-none"
                />
                {" "}individual{" "}
                <select className="inline border-b-2 border-blue-300 bg-transparent px-2 py-1 text-blue-600 font-semibold focus:border-blue-500 focus:outline-none">
                  <option value="">Choose...</option>
                  {innerUnits.map((unit) => (
                    <option key={unit.id} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                .
              </p>
              <p className="text-sm text-gray-600 italic">
                Example: "This product comes in <strong>CASES</strong> that contain <strong>24</strong> individual <strong>BOTTLES</strong>."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <LaborCostSettings />
    </div>
  );
}