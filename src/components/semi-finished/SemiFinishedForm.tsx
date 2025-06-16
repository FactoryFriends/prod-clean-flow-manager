
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormLabel } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";

import {
  SemiFinishedFormData,
  RecipeIngredient,
  parseNumberComma,
  calculateUnitSize,
} from "./semifinishedFormUtils";
import { BatchAndUnitFields } from "./BatchAndUnitFields";
import { RecipeIngredientsInput } from "./RecipeIngredientsInput";
import { SemiFinishedFormFields } from "./SemiFinishedFormFields";
import { PricingFields } from "./PricingFields";

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

  // FIXED: Remove the infinite loop by simplifying the unit size calculation
  const batchSize = form.watch("batch_size");
  const packagesPerBatch = form.watch("packages_per_batch");
  const batchUnit = form.watch("batch_unit");
  
  const unitSize = React.useMemo(() => {
    return calculateUnitSize(
      parseNumberComma(batchSize as any) ?? 0,
      parseNumberComma(packagesPerBatch as any) ?? 1,
    );
  }, [batchSize, packagesPerBatch]);

  // Update unit_type to match batch_unit and unit_size when batch values change
  React.useEffect(() => {
    form.setValue("unit_type", batchUnit);
    form.setValue("unit_size", parseNumberComma(unitSize) ?? 0);
  }, [batchUnit, unitSize, form]);

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
          <SemiFinishedFormFields
            suppliers={suppliers}
            validateUniqueName={validateUniqueName}
            unitSize={unitSize}
            batchUnit={batchUnit}
          />

          {/* BATCH section */}
          <BatchAndUnitFields />

          {/* Recipe (per batch) */}
          <div>
            <FormLabel>Recipe (Ingredients per batch)</FormLabel>
            <RecipeIngredientsInput
              ingredientOptions={ingredientOptions}
              recipe={recipe}
              setRecipe={setRecipe}
            />
          </div>

          <PricingFields recipe={recipe} allProducts={allProducts} />

          <Button type="submit" className="w-full">
            Save Semi-finished Product
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SemiFinishedForm;
