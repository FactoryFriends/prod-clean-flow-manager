import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateProduct, useUpdateProduct, Product } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { ProductMainFields } from "./ProductMainFields";
import { ProductPricingFields } from "./ProductPricingFields";

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
    supplier_package_unit: editingProduct?.supplier_package_unit || "",
    units_per_package: editingProduct?.units_per_package ?? null,
    inner_unit_type: editingProduct?.inner_unit_type || "",
    price_per_package: editingProduct?.price_per_package ?? null,
  });

  useEffect(() => {
    if (editingProduct?.product_fiche_url)
      setFormData((f) => ({
        ...f,
        product_fiche_url: editingProduct.product_fiche_url,
      }));
  }, [editingProduct]);

  const { data: suppliers = [] } = useSuppliers();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleMainFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "price_per_package" || field === "units_per_package"
        ? {
            price_per_unit:
              (field === "price_per_package" ? value : prev.price_per_package) && (field === "units_per_package" ? value : prev.units_per_package)
                ? (
                    ((field === "price_per_package" ? value : prev.price_per_package) ?? 0) /
                    ((field === "units_per_package" ? value : prev.units_per_package) || 1)
                  )
                : prev.price_per_unit
          }
        : {})
    }));
  };

  const handlePricingChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let product_type = formData.product_type;
    
    // Debug: log the current state
    console.log("Form data:", formData);
    console.log("Suppliers:", suppliers);
    console.log("Product type:", product_type);
    
    // Get supplier name from selected supplier_id or fall back to form data
    let supplier_name = "TOTHAI PRODUCTION";
    if (product_type === "extern" || product_type === "ingredient") {
      if (formData.supplier_id) {
        const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);
        console.log("Selected supplier:", selectedSupplier);
        supplier_name = selectedSupplier?.name || formData.supplier_name || "";
      } else {
        supplier_name = formData.supplier_name || "";
      }
      console.log("Final supplier_name:", supplier_name);
    }
    // Calculate price_per_unit for reporting, margin calculations
    const pricePerUnit =
      formData.price_per_package && formData.units_per_package > 0
        ? formData.price_per_package / formData.units_per_package
        : formData.price_per_package ?? formData.price_per_unit ?? 0;

    const productData: any = {
      name: formData.name,
      unit_size: Number(formData.unit_size),
      unit_type: formData.unit_type,
      packages_per_batch: Number(formData.packages_per_batch),
      shelf_life_days:
        product_type === "zelfgemaakt"
          ? formData.shelf_life_days
            ? Number(formData.shelf_life_days)
            : null
          : null,
      price_per_unit: pricePerUnit,
      active: formData.active,
      product_type: product_type,
      supplier_name: supplier_name,
      product_kind: product_type,
      pickable: false,
      supplier_id: formData.supplier_id || null,
      product_fiche_url:
        product_type === "extern" || product_type === "ingredient"
          ? formData.product_fiche_url || null
          : null,
      cost: Number(formData.cost) || 0,
      markup_percent: Number(formData.markup_percent) || 0,
      sales_price: Number(formData.sales_price) || 0,
      minimal_margin_threshold_percent: Number(formData.minimal_margin_threshold_percent) || 25,
      supplier_package_unit: formData.supplier_package_unit,
      units_per_package: formData.units_per_package,
      inner_unit_type: formData.inner_unit_type,
      price_per_package: formData.price_per_package,
    };

    if (
      product_type === "extern" &&
      (!supplier_name || supplier_name.trim() === "")
    ) {
      alert("Please select a supplier for external products.");
      return;
    }

    if (
      product_type === "ingredient" &&
      (!supplier_name || supplier_name.trim() === "")
    ) {
      alert("Please select a supplier for ingredients.");
      return;
    }

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, ...productData },
        {
          onSuccess: onSuccess,
        }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: onSuccess,
      });
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductMainFields formData={formData} onFieldChange={handleMainFieldChange} />
      <ProductPricingFields
        cost={formData.cost}
        markup_percent={formData.markup_percent}
        sales_price={formData.sales_price}
        minimal_margin_threshold_percent={formData.minimal_margin_threshold_percent}
        onChange={handlePricingChange}
      />
      {editingProduct && (
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, active: checked })
            }
          />
          <label htmlFor="active">Active</label>
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
