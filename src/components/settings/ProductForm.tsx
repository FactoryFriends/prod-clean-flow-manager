import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateProduct, useUpdateProduct, Product } from "@/hooks/useProductionData";
import { ProductFicheUpload } from "./ProductFicheUpload";
import { ProductSupplierSelect } from "./ProductSupplierSelect";

interface ProductFormProps {
  editingProduct?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ editingProduct, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    unit_size: editingProduct?.unit_size || 1,
    unit_type: editingProduct?.unit_type || "liter",
    packages_per_batch: editingProduct?.packages_per_batch || 1,
    shelf_life_days: editingProduct?.shelf_life_days || 7,
    price_per_unit: editingProduct?.price_per_unit || 0,
    active: editingProduct?.active ?? true,
    product_type: editingProduct?.product_type || "zelfgemaakt",
    supplier_name: editingProduct?.supplier_name || "TOTHAI PRODUCTION",
    pickable: editingProduct?.pickable ?? false,
    supplier_id: editingProduct?.supplier_id || null,
    product_fiche_url: editingProduct?.product_fiche_url || null,
    cost: editingProduct?.cost || 0,
    markup_percent: editingProduct?.markup_percent || 0,
    sales_price: editingProduct?.sales_price || 0,
    minimal_margin_threshold_percent: editingProduct?.minimal_margin_threshold_percent || 25,
  });

  useEffect(() => {
    if (editingProduct?.product_fiche_url) setFormData(f => ({ ...f, product_fiche_url: editingProduct.product_fiche_url }));
  }, [editingProduct]);

  // Calculated Sales Price
  const fixedCost = Number(formData.cost) || 0;
  const markupPercent = Number(formData.markup_percent) || 0;
  const fixedSalesPrice = Number(formData.sales_price) || 0;
  const calculatedSalesPrice = fixedCost + (fixedCost * markupPercent / 100);
  const deltaSalesPrice = calculatedSalesPrice - fixedSalesPrice;
  const deltaColor = deltaSalesPrice >= 0 ? "text-green-700" : "text-red-600";

  // Margin calculation helper
  const marginPct = (() => {
    if (!formData.sales_price || !formData.cost) return null;
    if (Number(formData.sales_price) === 0) return null;
    return (
      ((Number(formData.sales_price) - Number(formData.cost)) / Number(formData.sales_price)) *
      100
    );
  })();

  const showMarginAlarm =
    marginPct !== null &&
    formData.minimal_margin_threshold_percent !== undefined &&
    marginPct < formData.minimal_margin_threshold_percent;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let product_type = formData.product_type;
    let supplier_name =
      product_type === "zelfgemaakt"
        ? "TOTHAI PRODUCTION"
        : formData.supplier_name;

    const productData: any = {
      name: formData.name,
      unit_size: Number(formData.unit_size),
      unit_type: formData.unit_type,
      packages_per_batch: Number(formData.packages_per_batch),
      // Only include shelf_life_days if relevant
      shelf_life_days: (product_type === "zelfgemaakt" ? (
        formData.shelf_life_days ? Number(formData.shelf_life_days) : null
      ) : null),
      price_per_unit: formData.price_per_unit ? Number(formData.price_per_unit) : null,
      active: formData.active,
      product_type: product_type,
      supplier_name: supplier_name,
      product_kind: product_type,
      pickable: false,
      supplier_id: formData.supplier_id || null,
      // Only include product_fiche_url if relevant
      product_fiche_url: (
        product_type === "extern" || product_type === "ingredient"
          ? formData.product_fiche_url || null
          : null
      ),
      cost: Number(formData.cost) || 0,
      markup_percent: Number(formData.markup_percent) || 0,
      sales_price: Number(formData.sales_price) || 0,
      minimal_margin_threshold_percent: Number(formData.minimal_margin_threshold_percent) || 25,
    };

    if (
      product_type === "extern" &&
      (!formData.supplier_name || formData.supplier_name.trim() === "")
    ) {
      alert("Vul de naam van de externe leverancier in.");
      return;
    }

    if (
      product_type === "ingredient" &&
      (!formData.supplier_name || formData.supplier_name.trim() === "")
    ) {
      alert("Vul de naam van de leverancier voor ingrediënt in.");
      return;
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...productData }, {
        onSuccess: onSuccess,
      });
    } else {
      createProduct.mutate(productData, {
        onSuccess: onSuccess,
      });
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_type">Unit Type</Label>
          <Select
            value={formData.unit_type}
            onValueChange={(value) => setFormData({ ...formData, unit_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="liter">Liter</SelectItem>
              <SelectItem value="kg">Kilogram</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="ml">Milliliter</SelectItem>
              <SelectItem value="g">Gram</SelectItem>
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
            onChange={(e) => setFormData({ ...formData, unit_size: Number(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, packages_per_batch: Number(e.target.value) })}
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
                setFormData({
                  ...formData,
                  shelf_life_days: e.target.value ? Number(e.target.value) : null,
                })
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
            onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_type">Type</Label>
          <Select
            value={formData.product_type}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                product_type: value,
                supplier_name: value === "zelfgemaakt" ? "TOTHAI PRODUCTION" : "",
                supplier_id: value === "zelfgemaakt" ? null : prev.supplier_id,
                // Remove or keep fiche url depending on selection
                product_fiche_url: (value === "extern" || value === "ingredient") ? prev.product_fiche_url : null,
                // Remove shelf life for non-self-made
                shelf_life_days: value === "zelfgemaakt" ? prev.shelf_life_days : null,
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kies type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zelfgemaakt">Zelfgemaakt</SelectItem>
              <SelectItem value="extern">Extern product</SelectItem>
              <SelectItem value="ingredient">Ingrediënt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ProductSupplierSelect
          value={formData.supplier_id}
          onChange={val => setFormData({ ...formData, supplier_id: val })}
          productType={formData.product_type}
          required={formData.product_type === "extern" || formData.product_type === "ingredient"}
        />

        {/* Show fiche upload for extern & ingredient */}
        {(formData.product_type === "extern" || formData.product_type === "ingredient") && (
          <ProductFicheUpload
            value={formData.product_fiche_url}
            onChange={val => setFormData({ ...formData, product_fiche_url: val })}
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
              setFormData({ ...formData, supplier_name: e.target.value })
            }
          />
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (€)</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          min="0"
          value={formData.cost ?? ""}
          onChange={e => setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : 0 })}
          required
        />
      </div>

      {/* Markup % */}
      <div className="space-y-2">
        <Label htmlFor="markup_percent">Markup (%)</Label>
        <Input
          id="markup_percent"
          type="number"
          step="0.01"
          min="0"
          value={formData.markup_percent ?? ""}
          onChange={e => setFormData({ ...formData, markup_percent: e.target.value ? Number(e.target.value) : 0 })}
        />
      </div>

      {/* --- NEW: CALCULATED SALES PRICE --- */}
      <div>
        <Label>Calculated Sales Price (€)</Label>
        <Input
          value={calculatedSalesPrice.toFixed(2)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          Calculated: Cost + (Cost × Markup %)
        </div>
      </div>

      {/* Sales Price */}
      <div className="space-y-2">
        <Label htmlFor="sales_price">Sales Price (€)</Label>
        <Input
          id="sales_price"
          type="number"
          step="0.01"
          min="0"
          value={formData.sales_price ?? ""}
          onChange={e => setFormData({ ...formData, sales_price: e.target.value ? Number(e.target.value) : 0 })}
        />
      </div>

      {/* --- NEW: DELTA --- */}
      <div>
        <Label>Delta (€)</Label>
        <Input
          value={deltaSalesPrice.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaColor}`}
        />
        <div className={`text-xs mt-1 italic ${deltaColor}`}>
          {deltaSalesPrice >= 0
            ? "Fixed sales price is equal or below calculated (OK)"
            : "Fixed sales price is higher than calculated!"}
        </div>
      </div>

      {/* Minimal margin threshold */}
      <div className="space-y-2">
        <Label htmlFor="minimal_margin_threshold_percent">Minimal Margin Threshold (%)</Label>
        <Input
          id="minimal_margin_threshold_percent"
          type="number"
          step="0.01"
          min="0"
          value={formData.minimal_margin_threshold_percent ?? ""}
          onChange={e => setFormData({ ...formData, minimal_margin_threshold_percent: e.target.value ? Number(e.target.value) : 25 })}
        />
      </div>

      {/* Effective Margin */}
      <div className="text-sm font-medium mt-2">
        Effective Margin:{" "}
        <span className={showMarginAlarm ? "text-red-600" : "text-green-700"}>
          {marginPct !== null ? `${marginPct.toFixed(2)}%` : "—"}
        </span>
        {showMarginAlarm && (
          <span className="ml-2 text-red-500 font-bold animate-pulse">
            ⚠ Below minimal threshold!
          </span>
        )}
      </div>

      {editingProduct && (
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, active: checked })
            }
          />
          <Label htmlFor="active">Active</Label>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : editingProduct
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
