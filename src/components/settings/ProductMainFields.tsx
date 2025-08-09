import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFicheUpload } from "./ProductFicheUpload";
import { ProductSupplierSelect } from "./ProductSupplierSelect";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import React from "react";

interface ProductMainFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function ProductMainFields({ formData, onFieldChange }: ProductMainFieldsProps) {
  const { innerUnits } = useUnitOptions();
  const showSupplierPackageFields =
    formData.product_type === "extern" ||
    formData.product_type === "ingredient" ||
    formData.product_type === "drink";

  const isZelfgemaakt = formData.product_type === "zelfgemaakt";
  const isPurchased = formData.product_type === "extern" || formData.product_type === "ingredient" || formData.product_type === "drink";

  return (
    <div className="space-y-6">
      {/* STEP 1: PRODUCT TYPE - Most Important Field */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="space-y-2">
          <Label htmlFor="product_type" className="text-lg font-semibold text-blue-900">
            Product Type *
          </Label>
          <Select
            value={formData.product_type}
            onValueChange={(value) => {
              onFieldChange("product_type", value);
              onFieldChange(
                "supplier_name",
                value === "zelfgemaakt" ? "TOTHAI PRODUCTION" : ""
              );
              onFieldChange(
                "supplier_id",
                value === "zelfgemaakt" ? null : formData.supplier_id
              );
              onFieldChange(
                "product_fiche_url",
                (value === "extern" || value === "ingredient") ? formData.product_fiche_url : null
              );
              onFieldChange(
                "shelf_life_days",
                value === "zelfgemaakt" ? formData.shelf_life_days : null
              );
            }}
          >
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="Select product type first..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zelfgemaakt">Zelfgemaakt (Self-made)</SelectItem>
              <SelectItem value="extern">Extern product (External)</SelectItem>
              <SelectItem value="ingredient">Ingrediënt (Ingredient)</SelectItem>
              <SelectItem value="drink">Drink</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-blue-700 mt-2">
            {isZelfgemaakt && "✓ Cost will be calculated from recipe ingredients"}
            {isPurchased && "✓ Cost will come from supplier invoice"}
            {!formData.product_type && "Choose the type to see relevant fields"}
          </div>
        </div>
      </div>

      {/* Only show other fields after type is selected */}
      {formData.product_type && (
        <>
          {/* STEP 2: BASIC INFO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name (English) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_thai">Product Name (Thai) - Optional</Label>
              <Input
                id="name_thai"
                value={formData.name_thai || ""}
                onChange={(e) => onFieldChange("name_thai", e.target.value)}
                placeholder="e.g. น้ำแกงโฮมเมด"
              />
            </div>
          </div>

          {/* STEP 3: SUPPLIER INFO (only for purchased products) */}
          {isPurchased && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">
                📦 Supplier & Purchase Information
              </h3>
              <div className="text-sm text-orange-700 mb-4">
                Information about how you purchase this product from your supplier.
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ProductSupplierSelect
                    value={formData.supplier_id}
                    onChange={val => onFieldChange("supplier_id", val)}
                    productType={formData.product_type}
                    required={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier_package_unit">What does supplier sell? *</Label>
                  <Select
                    value={formData.supplier_package_unit || ""}
                    onValueChange={(value) => onFieldChange("supplier_package_unit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="e.g. TRAY, CASE, BOX..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      <SelectItem value="CASE">CASE</SelectItem>
                      <SelectItem value="BOX">BOX</SelectItem>
                      <SelectItem value="BAG">BAG</SelectItem>
                      <SelectItem value="BOTTLE">BOTTLE</SelectItem>
                      <SelectItem value="CAN">CAN</SelectItem>
                      <SelectItem value="CARTON">CARTON</SelectItem>
                      <SelectItem value="PACK">PACK</SelectItem>
                      <SelectItem value="PALLET">PALLET</SelectItem>
                      <SelectItem value="SACK">SACK</SelectItem>
                      <SelectItem value="TRAY">TRAY</SelectItem>
                      <SelectItem value="UNIT">UNIT</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="LITER">LITER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_package">Price per {formData.supplier_package_unit || 'Package'} (€) *</Label>
                  <Input
                    id="price_per_package"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_package ?? ""}
                    onChange={e => onFieldChange("price_per_package", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Invoice price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units_per_package">
                    How many units per {formData.supplier_package_unit || 'package'}?
                  </Label>
                  <Input
                    id="units_per_package"
                    type="number"
                    min="1"
                    value={formData.units_per_package ?? ""}
                    placeholder="e.g. 30 eggs per tray"
                    onChange={e => onFieldChange("units_per_package", e.target.value ? Number(e.target.value) : null)}
                  />
                  <div className="text-xs text-orange-600">
                    Leave blank if sold as single units (no subdivision)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inner_unit_type">What type of units inside?</Label>
                  <Input
                    id="inner_unit_type"
                    type="text"
                    placeholder="e.g. PIECE, BOTTLE, etc."
                    value={formData.inner_unit_type || ""}
                    onChange={e => onFieldChange("inner_unit_type", e.target.value)}
                  />
                </div>

                {/* Calculated cost per unit */}
                <div className="col-span-2">
                  <Label>Cost per unit (€)</Label>
                  <Input
                    value={
                      formData.price_per_package && formData.units_per_package > 0
                        ? (formData.price_per_package / formData.units_per_package).toFixed(4)
                        : (formData.price_per_package
                          ? Number(formData.price_per_package).toFixed(4)
                          : "")
                    }
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <div className="text-xs text-orange-600 italic mt-1">
                    {formData.price_per_package && formData.units_per_package > 0
                      ? `Calculated: €${formData.price_per_package} ÷ ${formData.units_per_package} units`
                      : `Equal to package price if not subdivided`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCTION/PACKAGING INFO */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              {isZelfgemaakt ? "🍳 Production & Packaging" : "📋 Usage & Packaging"}
            </h3>
            <div className="text-sm text-green-700 mb-4">
              {isZelfgemaakt 
                ? "How you produce and package this product for sale/use."
                : "How you use this purchased product in your recipes/operations."
              }
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_size">
                  {isZelfgemaakt 
                    ? "Quantity per final package *"
                    : "Standard recipe quantity *"
                  }
                </Label>
                <Input
                  id="unit_size"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.unit_size}
                  onChange={(e) => onFieldChange("unit_size", Number(e.target.value))}
                  placeholder={isZelfgemaakt ? "e.g. 4" : "e.g. 1"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_type">
                  {isZelfgemaakt ? "Unit type *" : "Recipe unit type *"}
                </Label>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) => onFieldChange("unit_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit type..." />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {innerUnits.map((unit) => (
                      <SelectItem key={unit} value={unit.toLowerCase()}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-green-600">
                  {isZelfgemaakt 
                    ? `Each package will contain ${formData.unit_size || "X"} ${formData.unit_type || "units"}`
                    : `Recipe uses ${formData.unit_size || "X"} ${formData.unit_type || "units"} as standard portion`
                  }
                </div>
              </div>

              {isZelfgemaakt && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="packages_per_batch">Packages per production batch</Label>
                    <Input
                      id="packages_per_batch"
                      type="number"
                      min="1"
                      value={formData.packages_per_batch}
                      onChange={(e) => onFieldChange("packages_per_batch", Number(e.target.value))}
                      placeholder="How many packages from one batch?"
                      required
                    />
                    <div className="text-xs text-green-600">
                      This determines how many labels you'll need to print
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
                    <Input
                      id="shelf_life_days"
                      type="number"
                      min="1"
                      value={formData.shelf_life_days || ""}
                      onChange={(e) =>
                        onFieldChange("shelf_life_days", e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="e.g. 7"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Show fiche upload for purchased products */}
          {isPurchased && (
            <div className="space-y-2">
              <ProductFicheUpload
                value={formData.product_fiche_url}
                onChange={val => onFieldChange("product_fiche_url", val)}
              />
            </div>
          )}
        </>
      )}


    </div>
  );
}
