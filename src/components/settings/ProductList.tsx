
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllProducts, useDeleteProduct, Product } from "@/hooks/useProductionData";

interface ProductListProps {
  onEditProduct: (product: Product) => void;
}

export function ProductList({ onEditProduct }: ProductListProps) {
  const { data: products, isLoading } = useAllProducts();
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to deactivate this product?")) {
      deleteProduct.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No products found. Create your first product to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <Badge variant={product.active ? "default" : "secondary"}>
                  {product.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Size:</span> {product.unit_size} {product.unit_type}
                </div>
                <div>
                  <span className="font-medium">Packages/Batch:</span> {product.packages_per_batch}
                </div>
                <div>
                  <span className="font-medium">Shelf Life:</span> {product.shelf_life_days ? `${product.shelf_life_days} days` : "Not set"}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {product.price_per_unit ? `$${product.price_per_unit.toFixed(2)}` : "Not set"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditProduct(product)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(product.id)}
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
