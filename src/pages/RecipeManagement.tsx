import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { SemiFinishedForm } from "@/components/semi-finished/SemiFinishedForm";
import { DishForm } from "@/components/dishes/DishForm";

function DishesTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Dishes</h2>
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
