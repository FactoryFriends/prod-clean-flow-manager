
import React from "react";
import { IngredientForm } from "@/components/ingredients/IngredientForm";

export function RecipeManagement() {
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      <h1 className="text-3xl font-bold">Recipe Management</h1>
      <p className="text-muted-foreground">
        This is the central module for managing recipes, semi-finished products, ingredients, and margins within OptiThai.<br />
        Soon you will be able to manage products and their composition here, add labor hours, and let OptiThai calculate costs automatically.
      </p>
      <IngredientForm />
      {/* Later: tabs or cards for "Add Base Product", "Add Dish", etc. */}
    </div>
  );
}

export default RecipeManagement;

