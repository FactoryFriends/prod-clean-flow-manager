import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { SemiFinishedForm } from "@/components/semi-finished/SemiFinishedForm";
import { DishForm } from "@/components/dishes/DishForm";
import { useAllProducts, useDeleteProduct } from "@/hooks/useProductionData";
import { Button } from "@/components/ui/button";

// List table component used for all 3 product types
function ProductList({
  products,
  type,
  onEdit,
  onDeactivate,
}: {
  products: any[];
  type: string;
  onEdit: (product: any) => void;
  onDeactivate: (product: any) => void;
}) {
  if (!products?.length) {
    return (
      <div className="text-center text-muted-foreground italic my-8">
        No {type} found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 text-left capitalize">{type}</th>
            <th className="p-2 text-left">Supplier</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2 font-medium">{item.name}</td>
              <td className="p-2">{item.supplier_name || <span className="italic text-muted-foreground">Not set</span>}</td>
              <td className="p-2">
                {typeof item.price_per_unit === "number"
                  ? `€${Number(item.price_per_unit).toFixed(2)}`
                  : <span className="italic text-muted-foreground">Not set</span>}
              </td>
              <td className="p-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(item)}>EDIT</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeactivate(item)}
                  disabled={!item.active}
                >
                  DEACTIVATE
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IngredientsTab() {
  const { data: allProducts = [] } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Filter for ingredients — using 'as any' to access product_kind without TS error
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
          {/* Don't pass editProduct or onCompleted */}
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
          />
        </>
      )}
    </div>
  );
}

function SemiFinishedTab() {
  const { data: allProducts = [] } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Filter for semi-finished products — using 'as any' to access product_kind without TS error
  const semiFinished = allProducts.filter(
    (p) =>
      (p as any).product_kind === "zelfgemaakt" && (p as any).product_type !== "dish"
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
  const handleCancel = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Semi-finished</h2>
      {showForm ? (
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">{editProduct ? "Edit Semi-finished" : "Add Semi-finished"}</h3>
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
          </div>
          {/* Don't pass editProduct or onCompleted */}
          <SemiFinishedForm />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button onClick={handleAddNew}>Add New Semi-finished</Button>
          </div>
          <ProductList
            products={semiFinished}
            type="semi-finished"
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />
        </>
      )}
    </div>
  );
}

function DishesTab() {
  const { data: allProducts = [] } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // No debug log here
  const dishes = allProducts.filter((p) => (p as any).product_type === "dish");

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
  const handleCancel = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Dishes</h2>
      {showForm ? (
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">{editProduct ? "Edit Dish" : "Add Dish"}</h3>
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
          </div>
          {/* Use correct props: editingProduct & onSuccess */}
          <DishForm editingProduct={editProduct} onSuccess={handleCancel} />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button onClick={handleAddNew}>Add New Dish</Button>
          </div>
          <ProductList
            products={dishes}
            type="dish"
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />
        </>
      )}
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
