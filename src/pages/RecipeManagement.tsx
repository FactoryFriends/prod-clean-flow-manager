
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { SemiFinishedForm } from "@/components/semi-finished/SemiFinishedForm";
import { DishForm } from "@/components/dishes/DishForm";
import { useAllProducts } from "@/hooks/useProductionData";
import { useState } from "react";
import { useDishAllergens } from "@/components/dishes/DishAllergensUtils";
import { DishAllergensExport } from "@/components/dishes/DishAllergensExport";

// Helper inline so DishesTab can use it for all dishes
const rollupAllergens = (dish, allProducts) => {
  if (!dish || !allProducts) return [];
  // Collect all ingredient and semi-finished IDs
  const ingredientIds = (dish.recipe_ingredients || []).map(ri => ri.ingredient_id);
  const semiFinishedIds = (dish.recipe_semifinished || []).map(sf => sf.semifinished_id);
  // Find products in allProducts
  const ingredientAllergens = ingredientIds
    .map(id => allProducts.find(p => p.id === id)?.allergens || [])
    .flat();
  const semiFinishedAllergens = semiFinishedIds
    .map(id => allProducts.find(p => p.id === id)?.allergens || [])
    .flat();
  let all = [...ingredientAllergens, ...semiFinishedAllergens];
  all = all.filter(Boolean);
  const unique = Array.from(new Set(all));
  if (unique.length > 1 && unique.includes("No Allergens")) {
    return unique.filter(a => a !== "No Allergens");
  }
  return unique;
};

function DishesTab() {
  const { data: allProducts = [] } = useAllProducts();
  const dishes = allProducts.filter(p => p.product_type === "dish");
  const [selectedDish, setSelectedDish] = useState(null);

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Dishes</h2>
      <DishAllergensExport
        dishes={dishes}
        allProducts={allProducts}
        rollupAllergens={rollupAllergens}
        selectedDish={selectedDish}
      />
      <div className="overflow-x-auto mt-4">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-left">Allergens (Rolled-up)</th>
              <th className="p-2">Export</th>
            </tr>
          </thead>
          <tbody>
            {dishes?.map((dish) => {
              const allergens = rollupAllergens(dish, allProducts);
              return (
                <tr
                  key={dish.id}
                  className="border-b cursor-pointer hover:bg-muted/20"
                  onClick={() => setSelectedDish(dish)}
                >
                  <td className="p-2 font-medium">{dish.name}</td>
                  <td className="p-2">
                    {allergens.length === 0
                      ? <span className="italic text-muted-foreground">None</span>
                      : allergens.map(a =>
                        <span key={a} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded bg-orange-50 border text-orange-900 text-xs">{a}</span>
                      )
                    }
                  </td>
                  <td className="p-2 align-middle">
                    <DishAllergensExport
                      dishes={[dish]}
                      allProducts={allProducts}
                      rollupAllergens={rollupAllergens}
                      selectedDish={dish}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* The DishForm remains as it was */}
      <DishForm />
    </div>
  );
}

function SemiFinishedTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Semi-finished</h2>
      <SemiFinishedForm />
    </div>
  );
}

function IngredientsTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Ingredients</h2>
      <IngredientForm />
    </div>
  );
}

export function RecipeManagement() {
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      <h1 className="text-3xl font-bold">Recipe Management</h1>
      <p className="text-muted-foreground">
        Central place to manage dishes, semi-finished products, ingredients, and their costs.<br />
        Add or edit recipes and associate staff/labor time as needed.
      </p>
      <Tabs defaultValue="ingredients" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="semi-finished">Semi-finished</TabsTrigger>
          <TabsTrigger value="dishes">Dishes</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <IngredientsTab />
        </TabsContent>
        <TabsContent value="semi-finished">
          <SemiFinishedTab />
        </TabsContent>
        <TabsContent value="dishes">
          <DishesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecipeManagement;

