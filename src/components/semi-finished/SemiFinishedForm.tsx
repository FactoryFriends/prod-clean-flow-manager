
import React, { useState } from "react";
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
  labour_time_minutes: number | null;
};

type RecipeIngredient = {
  product_id: string;
  name: string;
  qty: number;
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

export function SemiFinishedForm() {
  const form = useForm<SemiFinishedFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "KG",
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

  const onSubmit = (data: SemiFinishedFormData) => {
    if (recipe.length === 0) {
      toast.error("Please add at least one ingredient to the recipe.");
      return;
    }

    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(data.unit_size),
        unit_type: data.unit_type,
        supplier_name:
          (data.supplier_id &&
            suppliers.find((s) => s.id === data.supplier_id)?.name) ||
          null,
        price_per_unit: null, // to be calculated later if needed
        packages_per_batch: 1,
        shelf_life_days: data.shelf_life_days
          ? Number(data.shelf_life_days)
          : null,
        product_type: "semi-finished",
        product_kind: "semi-finished",
        pickable: false,
        supplier_id: data.supplier_id || null,
        product_fiche_url: null,
        // New:
        labour_time_minutes: data.labour_time_minutes
          ? Number(data.labour_time_minutes)
          : null,
        recipe: recipe.map((ri) => ({
          product_id: ri.product_id,
          qty: ri.qty,
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
    if (ingredientQty <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    // Prevent duplicate
    if (recipe.find((r) => r.product_id === selectedIngredientId)) {
      toast.error("Already added");
      return;
    }
    setRecipe([
      ...recipe,
      {
        product_id: ingredient.id,
        name: ingredient.name,
        qty: ingredientQty,
        unit: ingredient.unit_type || ingredient.unit || "",
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

          {/* Shelf life input */}
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

          {/* Labour time input */}
          <FormField
            control={form.control}
            name="labour_time_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 45"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recipe ingredient selection UI */}
          <div>
            <FormLabel>Recipe (Ingredients)</FormLabel>
            <div className="flex flex-col md:flex-row gap-2 items-end mt-1">
              <div className="w-full">
                {/* Search/filter input for ingredients */}
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
                type="number"
                min="0"
                step="0.01"
                value={ingredientQty === 0 ? "" : ingredientQty}
                onChange={(e) => setIngredientQty(Number(e.target.value))}
              />
              <Button type="button" className="w-fit" onClick={handleAddIngredient}>
                Add
              </Button>
            </div>
            {recipe.length > 0 && (
              <div className="mt-3 border rounded bg-gray-50 px-3 py-2">
                <ul className="text-sm space-y-1">
                  {recipe.map((ing) => (
                    <li key={ing.product_id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{ing.name}</span>
                        <span className="ml-2">
                          {ing.qty} {ing.unit}
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
                Add ingredients to build the recipe for this product.
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
