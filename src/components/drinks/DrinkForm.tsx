import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import SupplierPackagingFields from "../shared/SupplierPackagingFields";

const DRINK_UNIT_OPTIONS = ["BOTTLE", "CAN", "LITER", "PIECE"];

interface DrinkFormData {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_id: string;
  price_per_unit: number;
  active: boolean;
  cost: number;
  markup_percent: number;
  sales_price: number;
  supplier_package_unit?: string;
  units_per_package?: number;
  inner_unit_type?: string;
  price_per_package?: number;
}

interface DrinkFormProps {
  onSuccess?: () => void;
}

export function DrinkForm({ onSuccess }: DrinkFormProps) {
  const form = useForm<DrinkFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "BOTTLE",
      supplier_id: "",
      price_per_unit: 0,
      active: true,
      cost: 0,
      markup_percent: 0,
      sales_price: 0,
      supplier_package_unit: "",
      units_per_package: undefined,
      inner_unit_type: "",
      price_per_package: undefined,
    },
  });

  const { innerUnits, purchaseUnits } = useUnitOptions();
  const [error, setError] = React.useState<string | null>(null);

  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();
  const { data: suppliers = [] } = useSuppliers();

  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const exists = allProducts.some(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  function validatePositive(v: any, label: string) {
    const n = Number(v);
    if (isNaN(n) || n <= 0) return `${label} must be a positive number`;
    return true;
  }

  const selectedSupplierId = form.watch("supplier_id");
  const unitsPerPackage = Number(form.watch("units_per_package")) || 1;
  const pricePerPackage = Number(form.watch("price_per_package")) || 0;

  // Get supplier name for display
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const supplierName = selectedSupplier?.name || "your supplier";

  // Auto-populate price_per_unit when packaging calculation is available
  React.useEffect(() => {
    if (pricePerPackage > 0 && unitsPerPackage > 0) {
      const calculatedPrice = pricePerPackage / unitsPerPackage;
      form.setValue("price_per_unit", calculatedPrice);
      form.setValue("cost", calculatedPrice);
    }
  }, [pricePerPackage, unitsPerPackage, form]);

  const cost = Number(form.watch("cost")) || 0;
  const markupPercent = Number(form.watch("markup_percent")) || 0;
  const fixedSalesPrice = Number(form.watch("sales_price")) || 0;

  const calculatedSalesPrice = cost + (cost * markupPercent / 100);
  const deltaSalesPrice = calculatedSalesPrice - fixedSalesPrice;
  const deltaColor = deltaSalesPrice >= 0 ? "text-green-700" : "text-red-600";

  const onSubmit = (data: DrinkFormData) => {
    setError(null);
    
    if (!data.unit_type || !innerUnits.map(u => u.toUpperCase()).includes((data.unit_type + '').toUpperCase())) {
      setError("Unit type must be selected from the dropdown.");
      return;
    }
    if (data.units_per_package !== undefined && Number(data.units_per_package) <= 0) {
      setError("Units per package must be greater than 0 if set.");
      return;
    }
    
    if (data.supplier_id && suppliers.length) {
      const sup = suppliers.find((s) => s.id === data.supplier_id);
      if (!sup) {
        setError("Supplier must be selected from the list.");
        return;
      }
      data.supplier_id = sup.id;
    }

    createProduct.mutate(
      {
        ...data,
        product_type: "drink",
        unit_type: data.unit_type.toUpperCase(),
        cost: Number(data.cost) || 0,
        markup_percent: Number(data.markup_percent) || 0,
        sales_price: Number(data.sales_price) || 0,
        supplier_package_unit: data.supplier_package_unit ? data.supplier_package_unit.toUpperCase() : undefined,
        inner_unit_type: data.inner_unit_type ? data.inner_unit_type.toUpperCase() : undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Drink</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required", validate: validateUniqueName }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Coca Cola 330ml" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Size</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    {DRINK_UNIT_OPTIONS.map((u) => (
                      <option value={u} key={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier_id"
            rules={{ required: "Supplier is required for drinks" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">Select supplier…</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SupplierPackagingFields 
            control={form.control} 
            show={!!selectedSupplierId} 
            supplierName={supplierName}
          />

          {pricePerPackage > 0 && unitsPerPackage > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                ✓ Calculated price per unit: €{(pricePerPackage / unitsPerPackage).toFixed(4)}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="markup_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Markup (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Calculated Sales Price (€)</FormLabel>
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

          <FormField
            control={form.control}
            name="sales_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Sales Price (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Delta (€)</FormLabel>
            <Input
              value={deltaSalesPrice.toFixed(2)}
              readOnly
              disabled
              className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaColor}`}
            />
            <div className={`text-xs mt-1 italic ${deltaColor}`}>
              {deltaSalesPrice >= 0
                ? "Final sales price is equal or below calculated (OK)"
                : "Final sales price is higher than calculated!"}
            </div>
          </div>

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel>{field.value ? "Active" : "Inactive"}</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Drink
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default DrinkForm;
