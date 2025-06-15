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
    return exists ? "Naam bestaat al – kies een unieke naam." : true;
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
      <h2 className="text-xl font-semibold mb-2">Ingrediënt toevoegen</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* NAAM (uniek) */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Naam is verplicht", validate: validateUniqueName }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naam</FormLabel>
                <FormControl>
                  <Input placeholder="bv. Scampi 13/15 diepvries" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRODUCTSOORT */}
          <FormField
            control={form.control}
            name="product_kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Productsoort</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="zelfgemaakt">Zelfgemaakt</option>
                    <option value="extern">Extern aangekocht</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* VERPAKKINGSEENHEID */}
          <FormField
            control={form.control}
            name="unit_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verpakkingseenheid</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* EENHEID (dropdown) */}
          <FormField
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eenheid</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm"
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

          {/* LEVERANCIER (dropdown) */}
          <FormField
            control={form.control}
            name="supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leverancier</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm"
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

          {/* PRIJS */}
          <FormField
            control={form.control}
            name="price_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prijs per eenheid (€)</FormLabel>
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

          {/* PICKBAAR */}
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
                <FormLabel className="mb-0">Pickbaar voor distributie</FormLabel>
              </FormItem>
            )}
          />

          {/* ALLERGENEN */}
          <FormField
            control={form.control}
            name="allergens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergenen</FormLabel>
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
            Ingrediënt opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
