
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts, useUpdateProduct, Product } from "@/hooks/useProductionData";
import { toast } from "sonner";
import { RecipeIngredientsInput } from "../semi-finished/RecipeIngredientsInput";
import { estimatedDishPrice } from "./useEstimatedDishCost";
import DishPriceSummary from "./DishPriceSummary";

export interface DishFormProps {
  editingProduct?: Product | null;
  onSuccess?: () => void;
}

export function DishForm({ editingProduct, onSuccess }: DishFormProps) {
  const form = useForm({
    defaultValues: {
      name: editingProduct?.name || "",
      description: editingProduct?.description || "",
      unit_size: editingProduct?.unit_size || "",
      unit_type: editingProduct?.unit_type || "liter",
      active: editingProduct?.active ?? true,
      labour_time_minutes: editingProduct?.labour_time_minutes ?? "",
      cost: editingProduct?.cost || 0,
      markup_percent: editingProduct?.markup_percent || 0,
      sales_price: editingProduct?.sales_price || 0,
      minimal_margin_threshold_percent: editingProduct?.minimal_margin_threshold_percent || 25
    }
  });

  const [recipe, setRecipe] = React.useState<any[]>([]);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: allProducts = [] } = useAllProducts();

  // Only allow as recipe: ingredients and semi-finished (active)
  const ingredientOptions = allProducts?.filter(
    (p) =>
      (p.product_type === "ingredient" || p.product_type === "semi-finished") && p.active
  ) || [];

  // Name uniqueness validation
  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const exists = allProducts.some(
      (p) =>
        p.name.trim().toLowerCase() === value.trim().toLowerCase() &&
        p.product_type === "dish" &&
        (!editingProduct || p.id !== editingProduct.id)
    );
    return exists
      ? "Name already exists – choose a unique name."
      : true;
  }

  // --- New calculated sales price and delta logic ---
  const recipeVal = recipe;
  const allProductsVal = allProducts;
  const labourMinutes = Number(form.watch("labour_time_minutes")) || 0;
  const markupPercent = Number(form.watch("markup_percent")) || 0;
  const fixedCost = Number(form.watch("cost")) || 0;
  const fixedSalesPrice = Number(form.watch("sales_price")) || 0;
  const minimalMargin = form.watch("minimal_margin_threshold_percent");

  function onSubmit(data: any) {
    if (recipe.length === 0) {
      toast.error("Please add at least one ingredient/semi-finished product to the recipe.");
      return;
    }

    const dishPayload: any = {
      name: data.name,
      description: data.description,
      unit_size: Number(data.unit_size),
      unit_type: data.unit_type,
      packages_per_batch: 1,
      price_per_unit: estimatedDishPrice(recipe, allProducts, data.labour_time_minutes),
      cost: Number(data.cost) || 0,
      markup_percent: Number(data.markup_percent) || 0,
      sales_price: Number(data.sales_price) || 0,
      minimal_margin_threshold_percent: Number(data.minimal_margin_threshold_percent) || 25,
      shelf_life_days: null,
      product_type: "dish",
      product_kind: "dish",
      pickable: false,
      active: data.active,
      recipe: recipe.map((ri) => ({
        product_id: ri.product_id,
        qty: Number(ri.qty),
        unit: ri.unit,
      })),
      labour_time_minutes: data.labour_time_minutes ? Number(data.labour_time_minutes) : null,
      supplier_id: null,
      supplier_name: null,
      product_fiche_url: null
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...dishPayload }, {
        onSuccess: () => {
          form.reset();
          setRecipe([]);
          toast.success("Dish updated");
          onSuccess && onSuccess();
        },
      });
    } else {
      createProduct.mutate(dishPayload, {
        onSuccess: () => {
          form.reset();
          setRecipe([]);
          toast.success("Dish created");
          onSuccess && onSuccess();
        },
      });
    }
  }

  React.useEffect(() => {
    // If editing, try to preload ingredients recipe if available
    if (editingProduct && (editingProduct as any).recipe?.length > 0) {
      setRecipe((editingProduct as any).recipe);
    }
  }, [editingProduct]);

  const estimatedPriceValue = estimatedDishPrice(
    recipe,
    allProducts,
    Number(form.watch("labour_time_minutes"))
  );

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">{editingProduct ? "Edit Dish" : "Add Dish"}</h2>

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
                  <Input placeholder="e.g. Pad Thai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description field (optional) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="A short description of the dish" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Unit size */}
            <FormField
              control={form.control}
              name="unit_size"
              rules={{ required: "Unit size is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.01}
                      min={0}
                      placeholder="e.g. 1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Unit type */}
            <FormField
              control={form.control}
              name="unit_type"
              rules={{ required: "Unit type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="liter">Liter</option>
                      <option value="kg">Kilogram</option>
                      <option value="pieces">Pieces</option>
                      <option value="ml">Milliliter</option>
                      <option value="g">Gram</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active / Inactive Toggle */}
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  <FormLabel>{field.value ? "Active" : "Inactive"}</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Labour time */}
          <FormField
            control={form.control}
            name="labour_time_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 45"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recipe */}
          <div>
            <FormLabel>Recipe (Ingredients & Semi-finished)</FormLabel>
            {ingredientOptions.length === 0 ? (
              <div className="p-2 my-2 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 text-sm flex items-center gap-2">
                <span className="font-semibold">No ingredients or semi-finished products available!</span>
                <span className="ml-1">Please create and activate at least one ingredient or semi-finished product first.</span>
              </div>
            ) : (
              <RecipeIngredientsInput
                ingredientOptions={ingredientOptions}
                recipe={recipe}
                setRecipe={setRecipe}
              />
            )}
          </div>

          {/* Est price display */}
          <div>
            <FormLabel>Estimated Price per Unit (€)</FormLabel>
            <Input
              value={estimatedPriceValue.toFixed(2)}
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-muted-foreground italic mt-1">
              Price is calculated from the cost of selected ingredients/semi-finished per unit and labour time at €0.50/min.
            </div>
          </div>

          {/* COST */}
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
          {/* MARKUP % */}
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

          {/* --- SALES PRICE AND MARGIN SUMMARY --- */}
          <DishPriceSummary
            cost={fixedCost}
            markupPercent={markupPercent}
            fixedSalesPrice={fixedSalesPrice}
            minimalMargin={minimalMargin}
          />

          {/* SALES PRICE (EDITABLE) */}
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

          {/* Minimal margin threshold */}
          <FormField
            control={form.control}
            name="minimal_margin_threshold_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimal Margin Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {editingProduct ? "Update Dish" : "Save Dish"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default DishForm;
