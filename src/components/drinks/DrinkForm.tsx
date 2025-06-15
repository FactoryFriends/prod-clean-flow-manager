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
}

export function DrinkForm() {
  const form = useForm<DrinkFormData & {
    supplier_package_unit?: string;
    units_per_package?: number;
    inner_unit_type?: string;
    price_per_package?: number;
  }>({
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

  const supplierPackageUnit = form.watch("supplier_package_unit");
  const unitsPerPackage = Number(form.watch("units_per_package")) || 1;
  const innerUnitType = form.watch("inner_unit_type");
  const pricePerPackage = Number(form.watch("price_per_package")) || 0;
  const pricePerUnit = unitsPerPackage > 0 ? pricePerPackage / unitsPerPackage : pricePerPackage || 0;

  const cost = Number(form.watch("cost")) || 0;
  const markupPercent = Number(form.watch("markup_percent")) || 0;
  const fixedSalesPrice = Number(form.watch("sales_price")) || 0;

  const calculatedSalesPrice = cost + (cost * markupPercent / 100);
  const deltaSalesPrice = calculatedSalesPrice - fixedSalesPrice;
  const deltaColor = deltaSalesPrice >= 0 ? "text-green-700" : "text-red-600";

  const onSubmit = (data: DrinkFormData & {
    supplier_package_unit?: string;
    units_per_package?: number;
    inner_unit_type?: string;
    price_per_package?: number;
  }) => {
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(data.unit_size),
        unit_type: data.unit_type,
        packages_per_batch: 1,
        supplier_name:
          suppliers.find((s) => s.id === data.supplier_id)?.name || null,
        price_per_unit: Number(data.price_per_unit),
        shelf_life_days: null,
        product_type: "drink",
        product_kind: "extern",
        pickable: true,
        supplier_id: data.supplier_id || null,
        product_fiche_url: null,
        labour_time_minutes: null,
        active: data.active,
        recipe: null,
        cost: Number(data.cost) || 0,
        markup_percent: Number(data.markup_percent) || 0,
        sales_price: Number(data.sales_price) || 0,
        supplier_package_unit: data.supplier_package_unit,
        units_per_package: data.units_per_package ? Number(data.units_per_package) : null,
        inner_unit_type: data.inner_unit_type,
        price_per_package: data.price_per_package ? Number(data.price_per_package) : null,
        price_per_unit: data.price_per_package && data.units_per_package
          ? Number(data.price_per_package) / Number(data.units_per_package)
          : (data.price_per_package ?? data.price_per_unit ?? 0),
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Drink product created");
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Drink</h2>
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

          <FormField
            control={form.control}
            name="price_per_unit"
            rules={{ required: "Price is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per unit (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>Fixed Sales Price (€)</FormLabel>
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
                ? "Fixed sales price is equal or below calculated (OK)"
                : "Fixed sales price is higher than calculated!"}
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

          <FormField
            control={form.control}
            name="supplier_package_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Unit (e.g. CASE, BOX)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CASE, BOX" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="units_per_package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Units per Package{" "}
                  <span className="text-xs text-muted-foreground">(if relevant)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 24"
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  Leave blank if not packed as identical units.
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inner_unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inner Unit Type (e.g. BOTTLE, LITER, CAN)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. BOTTLE" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_per_package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Purchase Package (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Calculated per unit price */}
          <div>
            <FormLabel>Price per Unit (€)</FormLabel>
            <Input
              value={
                pricePerPackage && unitsPerPackage > 0
                  ? (pricePerPackage / unitsPerPackage).toFixed(4)
                  : (pricePerPackage ? pricePerPackage.toFixed(4) : "")
              }
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-muted-foreground italic mt-1">
              {pricePerPackage && unitsPerPackage > 0
                ? `Calculated: ${pricePerPackage} / ${unitsPerPackage}`
                : `Equal to package price if not packed as units`}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Drink
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default DrinkForm;

// File is now over 293 lines. This file is getting long – consider asking me to refactor it into smaller components for maintainability!
