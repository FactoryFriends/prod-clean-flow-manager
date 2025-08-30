import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFicheUpload } from "./ProductFicheUpload";
import { ProductSupplierSelect } from "./ProductSupplierSelect";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { useSupplierPackageUnits } from "@/hooks/useUnitOptions";
import { Package } from "lucide-react";
import React from "react";

interface ProductMainFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function ProductMainFields({ formData, onFieldChange }: ProductMainFieldsProps) {
  const { innerUnits } = useUnitOptions();
  const supplierPackageUnits = useSupplierPackageUnits();
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
                Tell us about your supplier's packaging to calculate the exact cost per unit.
              </div>
              
              <div className="space-y-4">
                <div>
                  <ProductSupplierSelect
                    value={formData.supplier_id}
                    onChange={val => onFieldChange("supplier_id", val)}
                    productType={formData.product_type}
                    required={true}
                  />
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-base text-gray-800 mb-4 leading-relaxed">
                    This product comes in{" "}
                    <span className="inline-block min-w-[120px] text-orange-600 font-semibold">
                      <Select
                        value={formData.supplier_package_unit || ""}
                        onValueChange={(value) => onFieldChange("supplier_package_unit", value)}
                      >
                        <SelectTrigger className="inline w-auto border-b-2 border-orange-300 bg-transparent px-2 py-1 text-orange-600 font-semibold focus:border-orange-500 border-t-0 border-l-0 border-r-0 rounded-none text-base">
                          <SelectValue placeholder="___" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          {supplierPackageUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </span>
                    {" "}and it costs me{" "}
                    <span className="inline-block min-w-[80px] text-orange-600 font-semibold">
                      €<Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price_per_package ?? ""}
                        onChange={e => onFieldChange("price_per_package", e.target.value ? Number(e.target.value) : null)}
                        placeholder="0.00"
                        className="inline w-20 border-b-2 border-orange-300 bg-transparent px-1 py-0 text-orange-600 font-semibold focus:border-orange-500 border-t-0 border-l-0 border-r-0 rounded-none text-base"
                      />
                    </span>
                    .
                  </p>
                  
                  <p className="text-base text-gray-800 mb-4 leading-relaxed">
                    Each package contains{" "}
                    <span className="inline-block min-w-[60px] text-orange-600 font-semibold">
                      <Input
                        type="number"
                        min="1"
                        value={formData.units_per_package ?? ""}
                        onChange={e => onFieldChange("units_per_package", e.target.value ? Number(e.target.value) : null)}
                        placeholder="1"
                        className="inline w-16 border-b-2 border-orange-300 bg-transparent px-1 py-0 text-orange-600 font-semibold focus:border-orange-500 border-t-0 border-l-0 border-r-0 rounded-none text-base"
                      />
                    </span>
                    {" "}units, and each unit is measured as{" "}
                    <span className="inline-block min-w-[100px] text-orange-600 font-semibold">
                      <Select
                        value={formData.inner_unit_type || ""}
                        onValueChange={(value) => onFieldChange("inner_unit_type", value)}
                      >
                        <SelectTrigger className="inline w-auto border-b-2 border-orange-300 bg-transparent px-2 py-1 text-orange-600 font-semibold focus:border-orange-500 border-t-0 border-l-0 border-r-0 rounded-none text-base">
                          <SelectValue placeholder="___" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          {innerUnits.map((unit) => (
                            <SelectItem key={unit} value={unit.toLowerCase()}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </span>
                    .
                  </p>

                  {/* Calculated cost per unit */}
                  {formData.price_per_package && (
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                      <p className="text-sm font-semibold text-orange-900">
                        ✓ Cost per unit: €
                        {formData.units_per_package > 0
                          ? (formData.price_per_package / formData.units_per_package).toFixed(4)
                          : Number(formData.price_per_package).toFixed(4)
                        }
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        {formData.units_per_package > 0
                          ? `€${formData.price_per_package} ÷ ${formData.units_per_package} units`
                          : `Equal to package price (not subdivided)`
                        }
                      </p>
                    </div>
                  )}
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
                <Label htmlFor="package_type">
                  {isZelfgemaakt ? "Package type *" : "Recipe unit type *"}
                </Label>
                <div className="text-sm text-green-700 mb-2">
                  {isZelfgemaakt 
                    ? "What will you package this product in?" 
                    : "What unit do you use in recipes?"
                  }
                </div>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) => onFieldChange("unit_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isZelfgemaakt ? "Select package type..." : "Select unit type..."} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {isZelfgemaakt ? (
                      <>
                        <SelectItem value="bag">BAG</SelectItem>
                        <SelectItem value="box">BOX</SelectItem>
                        <SelectItem value="bottle">BOTTLE</SelectItem>
                        <SelectItem value="container">CONTAINER</SelectItem>
                        <SelectItem value="pack">PACK</SelectItem>
                        <SelectItem value="tray">TRAY</SelectItem>
                        <SelectItem value="piece">PIECE</SelectItem>
                      </>
                    ) : (
                      innerUnits.map((unit) => (
                        <SelectItem key={unit} value={unit.toLowerCase()}>
                          {unit}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_size" className="flex items-center justify-between">
                  <span>
                    {isZelfgemaakt 
                      ? "Quantity per package *"
                      : "Standard recipe quantity *"
                    }
                  </span>
                  {isZelfgemaakt && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <Switch
                        checked={!!formData.variable_packaging}
                        onCheckedChange={(checked) => onFieldChange("variable_packaging", checked)}
                      />
                      <span className="text-xs text-muted-foreground">Variable</span>
                    </div>
                  )}
                </Label>
                <div className="text-sm text-green-700 mb-2">
                  {isZelfgemaakt 
                    ? (formData.variable_packaging 
                        ? "When variable packaging is enabled, users specify quantity per package when creating batches"
                        : "How many units will be in each package?"
                      )
                    : "How much do you typically use in recipes?"
                  }
                </div>
                <Input
                  id="unit_size"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.variable_packaging ? "" : formData.unit_size}
                  onChange={(e) => {
                    if (!formData.variable_packaging) {
                      onFieldChange("unit_size", Number(e.target.value));
                    }
                  }}
                  placeholder={formData.variable_packaging ? "Variable quantity per package" : "e.g. 3"}
                  disabled={formData.variable_packaging}
                  className={formData.variable_packaging ? "bg-muted cursor-not-allowed" : ""}
                  required={!formData.variable_packaging}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_unit_type">
                  {isZelfgemaakt ? "Unit type *" : "Unit type *"}
                </Label>
                <div className="text-sm text-green-700 mb-2">
                  {isZelfgemaakt 
                    ? "What unit will you measure the content in?" 
                    : "What unit do you measure this ingredient in?"
                  }
                </div>
                <Select
                  value={formData.inner_unit_type || ""}
                  onValueChange={(value) => onFieldChange("inner_unit_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="e.g. LITER, KG, PIECE..." />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {innerUnits.map((unit) => (
                      <SelectItem key={unit} value={unit.toLowerCase()}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isZelfgemaakt && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="packages_per_batch">Packages per production batch</Label>
                    <div className="text-sm text-green-700 mb-2">
                      How many labels will need to be printed
                    </div>
                    <Input
                      id="packages_per_batch"
                      type="number"
                      min="1"
                      value={formData.packages_per_batch}
                      onChange={(e) => onFieldChange("packages_per_batch", Number(e.target.value))}
                      placeholder="How many packages from one batch?"
                      required
                    />
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
