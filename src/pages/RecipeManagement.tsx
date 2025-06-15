import React from "react";
import { IngredientForm } from "@/components/ingredients/IngredientForm";

export function RecipeManagement() {
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      <h1 className="text-3xl font-bold">Recipe Management</h1>
      <p className="text-muted-foreground">
        Hier komt de centrale module voor het beheren van recepten, halffabrikaten, ingrediënten en marges binnen OptiThai.<br />
        Je kunt straks hier producten en hun samenstelling beheren, werkuren toevoegen, en kostprijzen automatisch laten berekenen.
      </p>
      <IngredientForm />
      {/* Later tabbladen of cards voor "Basisproduct toevoegen", "Gerecht toevoegen", etc. */}
    </div>
  );
}

export default RecipeManagement;
