import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateProduct, useUpdateProduct, Product } from "@/hooks/useProductionData";

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
  });

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
      shelf_life_days: formData.shelf_life_days ? Number(formData.shelf_life_days) : null,
      price_per_unit: formData.price_per_unit ? Number(formData.price_per_unit) : null,
      active: formData.active,
      product_type: product_type,
      supplier_name: supplier_name,
      product_kind: product_type,
      pickable: false,
    };

    if (product_type === "extern" && (!formData.supplier_name || formData.supplier_name.trim() === "")) {
      alert("Vul de naam van de externe leverancier in.");
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
          <Select value={formData.unit_type} onValueChange={(value) => setFormData({ ...formData, unit_type: value })}>
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

        <div className="space-y-2">
          <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
          <Input
            id="shelf_life_days"
            type="number"
            min="1"
            value={formData.shelf_life_days || ""}
            onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

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
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kies type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zelfgemaakt">Zelfgemaakt</SelectItem>
              <SelectItem value="extern">Extern product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_name">Leverancier</Label>
          <Input
            id="supplier_name"
            value={formData.product_type === "zelfgemaakt" ? "TOTHAI PRODUCTION" : formData.supplier_name || ""}
            disabled={formData.product_type === "zelfgemaakt"}
            required={formData.product_type === "extern"}
            placeholder={formData.product_type === "extern" ? "Naam externe leverancier" : ""}
            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
          />
        </div>
      </div>

      {editingProduct && (
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
