
import React, { useState } from "react";
import { useAllProducts, useDeleteProduct, usePermanentDeleteProduct, useReplaceIngredient } from "@/hooks/useProductionData";
import { Button } from "@/components/ui/button";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import ReplaceIngredientDialog from "@/components/ingredients/ReplaceIngredientDialog";
import ProductList from "./ProductList";
import { toast } from "sonner";

function IngredientsTab() {
  const { data: allProducts = [] } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const permanentDeleteProduct = usePermanentDeleteProduct();
  const replaceIngredient = useReplaceIngredient();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Replace dialog state
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [ingredientToReplace, setIngredientToReplace] = useState<any>(null);

  const ingredients = allProducts.filter(
    (p) =>
      (p as any).product_kind === "extern" && (p as any).product_type !== "dish"
  );

  const handleEdit = (item: any) => {
    setEditProduct(item);
    setShowForm(true);
  };
  const handleAddNew = () => {
    setEditProduct(null);
    setShowForm(true);
  };
  const handleDeactivate = (item: any) => {
    if (window.confirm(`Are you sure you want to deactivate "${item.name}"?`)) {
      deleteProduct.mutate(item.id);
    }
  };
  const handlePermanentDelete = (item: any) => {
    permanentDeleteProduct.mutate(item.id);
  };
  const handleReplace = (item: any) => {
    setIngredientToReplace(item);
    setReplaceOpen(true);
  };
  const handleReplaceConfirmed = (newIngredientId: string) => {
    if (!ingredientToReplace) return;
    replaceIngredient.mutate(
      {
        oldIngredientId: ingredientToReplace.id,
        newIngredientId,
      },
      {
        onSuccess: (data: any) => {
          toast.success(
            `Ingredient "${ingredientToReplace.name}" replaced in all recipes!`
          );
          setIngredientToReplace(null);
        },
        onError: (err: any) => {
          toast.error(
            "Failed to replace ingredient: " + (err?.message ?? "Unknown error")
          );
        },
      }
    );
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Ingredients</h2>
      {showForm ? (
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">{editProduct ? "Edit Ingredient" : "Add Ingredient"}</h3>
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
          </div>
          <IngredientForm />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button onClick={handleAddNew}>Add New Ingredient</Button>
          </div>
          <ProductList
            products={ingredients}
            type="ingredient"
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            onReplace={handleReplace}
            onPermanentlyDelete={handlePermanentDelete}
          />
          {ingredientToReplace && (
            <ReplaceIngredientDialog
              open={replaceOpen}
              onOpenChange={(open) => {
                setReplaceOpen(open);
                if (!open) setIngredientToReplace(null);
              }}
              ingredient={ingredientToReplace}
              allIngredients={ingredients}
              onReplace={handleReplaceConfirmed}
            />
          )}
        </>
      )}
    </div>
  );
}

export default IngredientsTab;
