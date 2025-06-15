
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
// (Placeholders for coming forms)
function DishesTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Dishes</h2>
      <p className="text-muted-foreground text-sm">
        Manage final products such as dishes here. (Coming soon)
      </p>
    </div>
  );
}

function HalfabrikaatTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Halfabrikaat</h2>
      <p className="text-muted-foreground text-sm">
        Manage semi-finished products here. (Coming soon)
      </p>
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
        Central place to manage dishes, halfabrikaat (semi-finished products), ingredients, and their costs.<br />
        Add or edit recipes and associate staff/labor time as needed.
      </p>
      <Tabs defaultValue="dishes" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dishes">Dishes</TabsTrigger>
          <TabsTrigger value="halfabrikaat">Halfabrikaat</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        </TabsList>

        <TabsContent value="dishes">
          <DishesTab />
        </TabsContent>
        <TabsContent value="halfabrikaat">
          <HalfabrikaatTab />
        </TabsContent>
        <TabsContent value="ingredients">
          <IngredientsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecipeManagement;
