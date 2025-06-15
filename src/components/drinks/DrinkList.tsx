
import { Edit, Trash2, Wine, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllProducts, useDeleteProduct, Product } from "@/hooks/useProductionData";

interface DrinkListProps {
  onEditProduct: (product: Product) => void;
}

export function DrinkList({ onEditProduct }: DrinkListProps) {
  const { data: products, isLoading } = useAllProducts();
  const deleteProduct = useDeleteProduct();

  // Filter only drink products
  const drinks = products?.filter(p => p.product_type === "drink") || [];

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to deactivate this drink?")) {
      deleteProduct.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading drinks...</div>;
  }

  if (drinks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wine className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No drinks found. Create your first drink to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drinks.map((drink) => (
        <div key={drink.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{drink.name}</h3>
                <Badge variant={drink.active ? "default" : "secondary"}>
                  {drink.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Size:</span> {drink.unit_size} {drink.unit_type}
                </div>
                <div>
                  <span className="font-medium">Supplier:</span> {drink.supplier_name || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Price:</span>{" "}
                  {drink.price_per_unit ? `€${Number(drink.price_per_unit).toFixed(2)}` : "Not set"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditProduct(drink)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(drink.id)}
                disabled={deleteProduct.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
