
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProduct } from "@/hooks/useProductionData";
import { toast } from "sonner";

type IngredientFormData = {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_name: string;
  price_per_unit: number;
  product_kind: "zelfgemaakt" | "extern";
  pickable: boolean;
  allergens: string[];
};

const ALLERGENS = [
  "Gluten", "Schaaldieren", "Eieren", "Vis", "Pinda’s",
  "Soja", "Melk", "Noten", "Selderij", "Mosterd",
  "Sesamzaad", "Sulfiet", "Lupine", "Weekdieren"
];

export function IngredientForm() {
  const form = useForm<IngredientFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "kg",
      supplier_name: "",
      price_per_unit: 0,
      product_kind: "zelfgemaakt",
      pickable: false,
      allergens: [],
    },
  });

  const createProduct = useCreateProduct();

  const onSubmit = (data: IngredientFormData) => {
    createProduct.mutate(
      {
        name: data.name,
        unit_size: data.unit_size,
        unit_type: data.unit_type,
        supplier_name: data.supplier_name || null,
        price_per_unit: Number(data.price_per_unit) || null,
        packages_per_batch: 1,
        shelf_life_days: null,
        product_type: data.product_kind,
        supplier_name: data.supplier_name,
        pickable: data.pickable,
        product_kind: data.product_kind,
        // Allergenen en afbeelding voorlopig niet naar database (kan later)
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
          <FormField
            control={form.control}
            name="name"
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

          {/* Productsoort: dropdown */}
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

          <FormField
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eenheid</FormLabel>
                <FormControl>
                  <Input placeholder="bv. kg, stuks, liter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leverancier</FormLabel>
                <FormControl>
                  <Input placeholder="bv. Metro, Bidfood..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Pickbaar checkbox */}
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

          {/* Allergenenlijst */}
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

          {/* Later: Afbeelding upload */}
          {/* <div>Afbeelding (optioneel): kan later toegevoegd worden</div> */}

          <Button type="submit" className="w-full">
            Ingrediënt opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
