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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name (English)</Label>
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

      <div className="space-y-2">
        <Label htmlFor="unit_type">Unit Type</Label>
        <Select
          value={formData.unit_type}
          onValueChange={(value) => onFieldChange("unit_type", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {innerUnits.map((unit) => (
              <SelectItem key={unit} value={unit.toLowerCase()}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit_size">Unit Size</Label>
        <Input
          id="unit_size"
          type="number"
          step="0.1"
          min="0"
          value={formData.unit_size}
          onChange={(e) => onFieldChange("unit_size", Number(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="packages_per_batch">Packages per Batch</Label>
        <Input
          id="packages_per_batch"
          type="number"
          min="1"
          value={formData.packages_per_batch}
          onChange={(e) => onFieldChange("packages_per_batch", Number(e.target.value))}
          required
        />
      </div>

      {/* Shelf life only for self-produced */}
      {formData.product_type === "zelfgemaakt" && (
        <div className="space-y-2">
          <Label htmlFor="shelf_life_days">
            Shelf Life (Days)
          </Label>
          <Input
            id="shelf_life_days"
            type="number"
            min="1"
            value={formData.shelf_life_days || ""}
            onChange={(e) =>
              onFieldChange("shelf_life_days", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="price_per_unit">Price per Unit</Label>
        <Input
          id="price_per_unit"
          type="number"
          step="0.01"
          min="0"
          value={formData.price_per_unit || ""}
          onChange={(e) => onFieldChange("price_per_unit", e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_type">Type</Label>
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
          <SelectTrigger>
            <SelectValue placeholder="Kies type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zelfgemaakt">Zelfgemaakt</SelectItem>
            <SelectItem value="extern">Extern product</SelectItem>
            <SelectItem value="ingredient">Ingrediënt</SelectItem>
            <SelectItem value="drink">Drink</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Supplier Package Fields */}
      {showSupplierPackageFields && (
        <>
          <div className="space-y-2">
            <Label htmlFor="supplier_package_unit">Purchase Unit (e.g. CASE, BOX)</Label>
            <Input
              id="supplier_package_unit"
              type="text"
              placeholder="e.g. CASE, BOX"
              value={formData.supplier_package_unit || ""}
              onChange={e => onFieldChange("supplier_package_unit", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="units_per_package">
              Units per Package 
              <span className="text-xs text-muted-foreground ml-1">(if relevant)</span>
            </Label>
            <Input
              id="units_per_package"
              type="number"
              min="1"
              value={formData.units_per_package ?? ""}
              placeholder="e.g. 24"
              onChange={e => onFieldChange("units_per_package", e.target.value ? Number(e.target.value) : null)}
            />
            <div className="text-xs text-muted-foreground">
              Leave blank if not packed as identical units.
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inner_unit_type">Inner Unit Type (e.g. BOTTLE, LITER, CAN)</Label>
            <Input
              id="inner_unit_type"
              type="text"
              placeholder="e.g. BOTTLE"
              value={formData.inner_unit_type || ""}
              onChange={e => onFieldChange("inner_unit_type", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_per_package">Price per Purchase Package (€)</Label>
            <Input
              id="price_per_package"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_package ?? ""}
              onChange={e => onFieldChange("price_per_package", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          {/* Calculated per unit price */}
          <div>
            <Label>Price per Unit (€)</Label>
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
            <div className="text-xs text-muted-foreground italic mt-1">
              {formData.price_per_package && formData.units_per_package > 0
                ? `Calculated: ${formData.price_per_package} / ${formData.units_per_package}`
                : `Equal to package price if not packed as units`}
            </div>
          </div>
        </>
      )}

      <ProductSupplierSelect
        value={formData.supplier_id}
        onChange={val => onFieldChange("supplier_id", val)}
        productType={formData.product_type}
        required={formData.product_type === "extern" || formData.product_type === "ingredient"}
      />

      {/* Show fiche upload for extern & ingredient */}
      {(formData.product_type === "extern" || formData.product_type === "ingredient") && (
        <ProductFicheUpload
          value={formData.product_fiche_url}
          onChange={val => onFieldChange("product_fiche_url", val)}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="supplier_name">Leverancier</Label>
        <Input
          id="supplier_name"
          value={
            formData.product_type === "zelfgemaakt"
              ? "TOTHAI PRODUCTION"
              : formData.supplier_name || ""
          }
          disabled={formData.product_type === "zelfgemaakt"}
          required={formData.product_type === "extern" || formData.product_type === "ingredient"}
          placeholder={
            formData.product_type === "extern" || formData.product_type === "ingredient"
              ? "Naam externe leverancier"
              : ""
          }
          onChange={(e) =>
            onFieldChange("supplier_name", e.target.value)
          }
        />
      </div>
    </div>
  );
}
