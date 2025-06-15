import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

import {
  SemiFinishedFormData,
  RecipeIngredient,
  formatNumberComma,
  parseNumberComma,
  calculateUnitSize,
  UNIT_OPTIONS,
} from "./semifinishedFormUtils";
import { BatchAndUnitFields } from "./BatchAndUnitFields";
import { RecipeIngredientsInput } from "./RecipeIngredientsInput";

// Placeholder for calculated price (implement actual logic later)
function calculatePricePlaceholder(
  recipe: RecipeIngredient[],
  allProducts: any[] | undefined
) {
  // TODO: fetch ingredient prices and compute for now just a placeholder
  // You could sum ingredient cost here if available
  return "Calculated from recipe";
}

export function SemiFinishedForm() {
  const form = useForm<SemiFinishedFormData>({
    defaultValues: {
      name: "",
      batch_size: 20,
      batch_unit: "LITER",
      packages_per_batch: 1,
      unit_size: 0, // calculated
      unit_type: "LITER",
      supplier_id: "",
      shelf_life_days: null,
      labour_time_minutes: null,
      active: true,
      cost: 0,
      markup_percent: 0,
      sales_price: 0,
      minimal_margin_threshold_percent: 25,
    },
  });

  // For ingredients selection in recipe
  const [recipe, setRecipe] = React.useState<RecipeIngredient[]>([]);

  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();
  const { data: suppliers = [] } = useSuppliers();

  // Pick only ingredient and semi-finished type products for selectable recipe items
  const ingredientOptions =
    allProducts?.filter(
      (p) =>
        (p.product_type === "ingredient" || p.product_type === "semi-finished") &&
        p.active
    ) || [];

  // Name uniqueness validation
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

  // For units, sync unit_type to batch_unit unless you support conversions
  React.useEffect(() => {
    // Auto-update unit_type and unit_size based on batch/unit fields
    const sub = form.watch(({ batch_size, batch_unit, packages_per_batch }) => {
      const autoUnitSize =
        batch_size && packages_per_batch
          ? Number(batch_size) / Number(packages_per_batch)
          : 0;
      form.setValue("unit_size", autoUnitSize);
      form.setValue("unit_type", batch_unit);
    });
    return () => sub?.unsubscribe?.();
  }, [form]);

  // Watch form fields for margin calculations
  const salesPrice = form.watch("sales_price");
  const cost = form.watch("cost");
  const minimalMargin = form.watch("minimal_margin_threshold_percent");
  const marginPct =
    salesPrice && cost && Number(salesPrice) > 0
      ? ((Number(salesPrice) - Number(cost)) / Number(salesPrice)) * 100
      : null;
  const showMarginAlarm =
    marginPct !== null &&
    minimalMargin !== undefined &&
    marginPct < minimalMargin;

  const onSubmit = (data: SemiFinishedFormData) => {
    if (recipe.length === 0) {
      toast.error("Please add at least one ingredient to the recipe.");
      return;
    }
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(parseNumberComma(data.unit_size as any)),
        unit_type: data.unit_type,
        packages_per_batch: Number(parseNumberComma(data.packages_per_batch as any)),
        supplier_name:
          (data.supplier_id &&
            suppliers.find((s) => s.id === data.supplier_id)?.name) ||
          null,
        price_per_unit: null, // to be calculated later if needed
        shelf_life_days: data.shelf_life_days
          ? Number(parseNumberComma(data.shelf_life_days as any))
          : null,
        product_type: "semi-finished",
        product_kind: "semi-finished",
        pickable: false,
        supplier_id: data.supplier_id || null,
        product_fiche_url: null,
        labour_time_minutes: data.labour_time_minutes
          ? Number(parseNumberComma(data.labour_time_minutes as any))
          : null,
        active: data.active,
        recipe: recipe.map((ri) => ({
          product_id: ri.product_id,
          qty: Number(parseNumberComma(ri.qty as any)),
          unit: ri.unit,
        })),
        cost: Number(data.cost) || 0,
        markup_percent: Number(data.markup_percent) || 0,
        sales_price: Number(data.sales_price) || 0,
        minimal_margin_threshold_percent: Number(data.minimal_margin_threshold_percent) || 25,
      },
      {
        onSuccess: () => {
          form.reset();
          setRecipe([]);
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
          {/* Basic info fields */}
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: "Name is required",
              validate: validateUniqueName,
            }}
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

          {/* BATCH section */}
          <BatchAndUnitFields />

          {/* Auto-calculated unit size */}
          <div>
            <FormLabel>
              Unit Size (auto-calculated)
            </FormLabel>
            <Input
              readOnly
              value={
                calculateUnitSize(
                  parseNumberComma(form.watch("batch_size") as any) ?? 0,
                  parseNumberComma(form.watch("packages_per_batch") as any) ?? 1,
                ) +
                (form.watch("batch_unit") ? ` ${form.watch("batch_unit")}` : "")
              }
              className="bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-muted-foreground italic mt-1">
              <span>
                Each unit will have this size. <br />
                For example: If a batch is 20 liters and makes 5 units, then unit size = 4,00 liters.
              </span>
            </div>
          </div>

          {/* Supplier */}
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

          {/* Shelf life input */}
          <FormField
            control={form.control}
            name="shelf_life_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf life (days)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 7"
                    {...field}
                    value={formatNumberComma(field.value)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d,]/g, "");
                      field.onChange(cleaned);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Labour time input */}
          <FormField
            control={form.control}
            name="labour_time_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 45"
                    {...field}
                    value={formatNumberComma(field.value)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d,]/g, "");
                      field.onChange(cleaned);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recipe (per batch) */}
          <div>
            <FormLabel>Recipe (Ingredients per batch)</FormLabel>
            <RecipeIngredientsInput
              ingredientOptions={ingredientOptions}
              recipe={recipe}
              setRecipe={setRecipe}
            />
          </div>

          {/* Calculated price/batch field */}
          <div>
            <FormLabel>Estimated price/batch (€)</FormLabel>
            <Input
              value={calculatePricePlaceholder(recipe, allProducts)}
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-muted-foreground italic mt-1">
              Price is automatically calculated from the ingredient recipe per batch.
            </div>
          </div>

          {/* Cost */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (€)</FormLabel>
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
          {/* Markup % */}
          <FormField
            control={form.control}
            name="markup_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Markup (%)</FormLabel>
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
          {/* Sales Price */}
          <FormField
            control={form.control}
            name="sales_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Price (€)</FormLabel>
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
          {/* Minimal margin threshold */}
          <FormField
            control={form.control}
            name="minimal_margin_threshold_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimal Margin Threshold (%)</FormLabel>
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

          {/* Margin */}
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

          {/* Active / Inactive Toggle */}
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
            Save Semi-finished Product
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SemiFinishedForm;
