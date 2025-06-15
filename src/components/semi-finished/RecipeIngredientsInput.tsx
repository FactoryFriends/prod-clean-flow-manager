
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecipeIngredient, formatNumberComma, parseNumberComma } from "./semifinishedFormUtils";
import { toast } from "sonner";

// Props: list of ingredient options, recipe state and handler funcs
export function RecipeIngredientsInput({
  ingredientOptions,
  recipe,
  setRecipe,
}: {
  ingredientOptions: { id: string; name: string; unit_type: string }[];
  recipe: RecipeIngredient[];
  setRecipe: (list: RecipeIngredient[]) => void;
}) {
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [ingredientQty, setIngredientQty] = useState<number>(0);

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
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-end mt-1">
        <div className="w-full">
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
  );
}
