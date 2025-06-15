
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngredientsTab from "./recipe-management/IngredientsTab";
import SemiFinishedTab from "./recipe-management/SemiFinishedTab";
import DishesTab from "./recipe-management/DishesTab";

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
