import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";

type SemiFinishedFormData = {
  name: string;
  batch_size: number;
  batch_unit: string;
  packages_per_batch: number;
  unit_size: number; // will be auto calculated, not user input
  unit_type: string; // matches batch_unit, but can adjust if you want to support conversion
  supplier_id?: string;
  shelf_life_days: number | null;
  labour_time_minutes: number | null;
};

type RecipeIngredient = {
  product_id: string;
  name: string;
  qty: number; // per batch!
  unit: string;
};

const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];

// Placeholder for calculated price (implement actual logic later)
function calculatePricePlaceholder(
  recipe: RecipeIngredient[],
  allProducts: any[] | undefined
) {
  // TODO: fetch ingredient prices and compute for now just a placeholder
  // You could sum ingredient cost here if available
  return "Calculated from recipe";
}

// Helpers for format/parse comma decimal
function formatNumberComma(n: number | string | undefined | null) {
  if (n === undefined || n === null || n === "") return "";
  const numberVal = typeof n === "number" ? n : parseFloat(String(n).replace(",", "."));
  if (isNaN(numberVal)) return "";
  return numberVal.toFixed(2).replace(".", ",");
}
function parseNumberComma(s: string) {
  if (!s) return undefined;
  return parseFloat(s.replace(",", "."));
}
// For calculateUnitSize: output as string with comma
function calculateUnitSize(batchSize: number, packagesPerBatch: number) {
  if (!batchSize || !packagesPerBatch || packagesPerBatch <= 0) return "";
  const v = batchSize / packagesPerBatch;
  return formatNumberComma(v);
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
    },
  });

  // For ingredients selection in recipe
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [ingredientQty, setIngredientQty] = useState<number>(0);

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

  const onSubmit = (data: SemiFinishedFormData) => {
    if (recipe.length === 0) {
      toast.error("Please add at least one ingredient to the recipe.");
      return;
    }
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(parseNumberComma(data.unit_size as any)), // calculated
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
        recipe: recipe.map((ri) => ({
          product_id: ri.product_id,
          qty: Number(parseNumberComma(ri.qty as any)),
          unit: ri.unit,
        })),
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

  function handleAddIngredient() {
    if (!selectedIngredientId) {
      toast.error("Select an ingredient");
      return;
    }
    const ingredient = ingredientOptions.find((i) => i.id === selectedIngredientId);
    if (!ingredient) return;
    if (!ingredientQty || parseNumberComma(ingredientQty as any) <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    if (recipe.find((r) => r.product_id === selectedIngredientId)) {
      toast.error("Already added");
      return;
    }
    setRecipe([
      ...recipe,
      {
        product_id: ingredient.id,
        name: ingredient.name,
        qty: Number(parseNumberComma(ingredientQty as any)),
        unit: ingredient.unit_type || "",
      },
    ]);
    setSelectedIngredientId("");
    setIngredientQty(0);
  }

  function handleRemoveRecipeIngredient(id: string) {
    setRecipe(recipe.filter((r) => r.product_id !== id));
  }

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
          <div className="flex gap-2 flex-col md:flex-row">
            <FormField
              control={form.control}
              name="batch_size"
              rules={{ required: "Batch size is required" }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Batch Size</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
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
            <FormField
              control={form.control}
              name="batch_unit"
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel>Batch Unit</FormLabel>
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
              name="packages_per_batch"
              rules={{
                required: "Packages per batch is required",
                min: { value: 1, message: "Must be at least 1" },
              }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Packages per Batch</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
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
          </div>

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
            <div className="flex flex-col md:flex-row gap-2 items-end mt-1">
              <div className="w-full">
                {/* Search for ingredients */}
                <Input
                  placeholder="Search ingredient"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="mb-2"
                />
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full border rounded-md bg-white text-sm px-2 py-1"
                >
                  <option value="">Select ingredient</option>
                  {ingredientOptions
                    .filter((ing) =>
                      ingredientSearch.trim().length === 0
                        ? true
                        : ing.name
                            .toLowerCase()
                            .includes(ingredientSearch.toLowerCase())
                    )
                    .map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit_type})
                      </option>
                    ))}
                </select>
              </div>
              <Input
                className="w-28"
                placeholder="Qty"
                type="text"
                inputMode="decimal"
                value={ingredientQty === 0 ? "" : formatNumberComma(ingredientQty)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d,]/g, "");
                  setIngredientQty(cleaned ? parseNumberComma(cleaned) ?? 0 : 0);
                }}
              />
              <span className="text-xs mb-2">
                {selectedIngredientId &&
                  ingredientOptions.find((i) => i.id === selectedIngredientId)
                    ?.unit_type}
              </span>
              <Button
                type="button"
                className="w-fit"
                onClick={handleAddIngredient}
              >
                Add
              </Button>
            </div>
            {recipe.length > 0 && (
              <div className="mt-3 border rounded bg-gray-50 px-3 py-2">
                <ul className="text-sm space-y-1">
                  {recipe.map((ing) => (
                    <li
                      key={ing.product_id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{ing.name}</span>
                        <span className="ml-2">
                          {formatNumberComma(ing.qty)} {ing.unit}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveRecipeIngredient(ing.product_id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.length === 0 && (
              <div className="text-xs text-muted-foreground italic mt-1">
                Add ingredients to build the recipe for this batch (input QTY per batch).
              </div>
            )}
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

          <Button type="submit" className="w-full">
            Save Semi-finished Product
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SemiFinishedForm;
