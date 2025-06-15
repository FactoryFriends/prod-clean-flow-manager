
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";

type SemiFinishedFormData = {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_id?: string;
  shelf_life_days: number | null;
};

const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];

// Placeholder for calculated price (implement actual logic later)
function calculatePricePlaceholder() {
  return "Calculated from recipe";
}

export function SemiFinishedForm() {
  const form = useForm<SemiFinishedFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "KG",
      supplier_id: "",
      shelf_life_days: null,
    },
  });

  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();
  const { data: suppliers = [] } = useSuppliers();

  // Name uniqueness validation (prevent duplicate semi-finished names)
  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const exists = allProducts.some(
      (p) =>
        p.name.trim().toLowerCase() === value.trim().toLowerCase() &&
        p.product_type === "semi-finished"
    );
    return exists
      ? "Name already exists – choose a unique name."
      : true;
  }

  const onSubmit = (data: SemiFinishedFormData) => {
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(data.unit_size),
        unit_type: data.unit_type,
        supplier_name: (data.supplier_id && suppliers.find(s => s.id === data.supplier_id)?.name) || null,
        price_per_unit: null, // will be set based on recipe, for now null
        packages_per_batch: 1,
        shelf_life_days: data.shelf_life_days ? Number(data.shelf_life_days) : null,
        product_type: "semi-finished",
        product_kind: "semi-finished",
        pickable: false,
        supplier_id: data.supplier_id || null,
        product_fiche_url: null,
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Semi-finished product created");
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Semi-finished Product</h2>
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
                  <Input placeholder="e.g. Homemade Curry Base" {...field} />
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
                <FormLabel>Batch Size</FormLabel>
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
                    {UNIT_OPTIONS.map((u) => (
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier (optional)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">None</option>
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

          {/* New shelf life input */}
          <FormField
            control={form.control}
            name="shelf_life_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf life (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 7"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Calculated price/batch field */}
          <div>
            <FormLabel>Estimated price/batch (€)</FormLabel>
            <Input
              value={calculatePricePlaceholder()}
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-muted-foreground italic mt-1">
              Price is automatically calculated from the ingredient recipe.
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Semi-finished Product
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SemiFinishedForm;
