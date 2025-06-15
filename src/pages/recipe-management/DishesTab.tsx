
import React, { useState } from "react";
import { useAllProducts, useDeleteProduct } from "@/hooks/useProductionData";
import { Button } from "@/components/ui/button";
import { DishForm } from "@/components/dishes/DishForm";
import ProductList from "./ProductList";

function DishesTab() {
  const { data: allProducts = [] } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

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

export default DishesTab;
