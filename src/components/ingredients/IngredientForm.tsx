import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { toast } from "sonner";
import { ALLERGENS } from "./constants/allergens";
import type { IngredientFormData } from "./types";

const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];
const SUPPLIER_OPTIONS = ["Metro", "Bidfood", "Makro", "Asia Center", "Vandemoortele", "Anders"];

export function IngredientForm() {
  const form = useForm<IngredientFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "KG",
      supplier_name: "",
      price_per_unit: 0,
      product_kind: "zelfgemaakt",
      pickable: false,
      allergens: [],
    },
  });

  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();

  // Validatie voor unieke naam (case-insensitive)
  function validateUniqueName(value: string) {
    if (!allProducts) return true; // Lijst nog niet geladen
    const exists = allProducts.some(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  const onSubmit = (data: IngredientFormData) => {
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(data.unit_size),
        unit_type: data.unit_type,
        supplier_name: data.supplier_name || null,
        price_per_unit: Number(data.price_per_unit) || null,
        packages_per_batch: 1,
        shelf_life_days: null,
        product_type: data.product_kind,
        product_kind: data.product_kind,
        pickable: Boolean(data.pickable),
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Ingredient</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* NAME (unique) */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required", validate: validateUniqueName }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Scampi 13/15 frozen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRODUCT TYPE */}
          <FormField
            control={form.control}
            name="product_kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="zelfgemaakt">Self-made</option>
                    <option value="extern">Purchased externally</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* PACKAGE SIZE */}
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

          {/* UNIT (dropdown) */}
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

          {/* SUPPLIER (dropdown) */}
          <FormField
            control={form.control}
            name="supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">--</option>
                    {SUPPLIER_OPTIONS.map((sup) => (
                      <option value={sup} key={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRICE */}
          <FormField
            control={form.control}
            name="price_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per unit (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PICKABLE */}
          <FormField
            control={form.control}
            name="pickable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="mb-0">Pickable for distribution</FormLabel>
              </FormItem>
            )}
          />

          {/* ALLERGENS */}
          <FormField
            control={form.control}
            name="allergens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergens</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((allergen) => (
                    <label
                      key={allergen}
                      className="flex items-center gap-1 text-xs bg-gray-50 border rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={field.value?.includes(allergen)}
                        onChange={() => {
                          if (field.value?.includes(allergen)) {
                            field.onChange(field.value.filter((a) => a !== allergen));
                          } else {
                            field.onChange([...(field.value || []), allergen]);
                          }
                        }}
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Ingredient
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
