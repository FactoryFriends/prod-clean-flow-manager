
import { Edit, Trash2, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllProducts, useDeleteProduct, Product } from "@/hooks/useProductionData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductListProps {
  onEditProduct: (product: Product) => void;
  typeFilter?: string;
  searchFilter?: string;
}

export function ProductList({ onEditProduct, typeFilter = "all", searchFilter = "" }: ProductListProps) {
  const { data: allProducts, isLoading } = useAllProducts();
  const deleteProduct = useDeleteProduct();

  const getProductTypeInfo = (product: any) => {
    if (product.product_type === "dish") {
      return { label: "Dish", variant: "default" as const };
    } else if (product.product_type === "drink") {
      return { label: "Drink", variant: "secondary" as const };
    } else if (product.product_kind === "zelfgemaakt") {
      return { label: "Semi-finished", variant: "outline" as const };
    } else if (product.product_type === "extern" || product.product_kind === "extern") {
      return { label: "External Product", variant: "destructive" as const };
    } else {
      return { label: "Ingredient", variant: "destructive" as const };
    }
  };

  function marginPct(product: any) {
    if (!product.sales_price || !product.cost) return null;
    if (Number(product.sales_price) === 0) return null;
    return (
      ((Number(product.sales_price) - Number(product.cost)) / Number(product.sales_price)) *
      100
    );
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to deactivate this product?")) {
      deleteProduct.mutate(id);
    }
  };

  // Filter products based on type and search
  const filteredProducts = allProducts?.filter((product) => {
    // Type filter
    let matchesType = true;
    if (typeFilter !== "all") {
      switch (typeFilter) {
        case "semi-finished":
          matchesType = product.product_kind === "zelfgemaakt" && product.product_type !== "dish" && product.product_type !== "drink";
          break;
        case "external":
          matchesType = product.product_type === "extern" || product.product_kind === "extern";
          break;
        case "ingredient":
          matchesType = product.product_type === "ingredient";
          break;
        case "dish":
          matchesType = product.product_type === "dish";
          break;
        case "drink":
          matchesType = product.product_type === "drink";
          break;
      }
    }

    // Search filter
    const matchesSearch = searchFilter === "" || 
      product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (product.supplier_name && product.supplier_name.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchesType && matchesSearch;
  }) || [];

  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No products found. Create your first product to get started.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No products match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {allProducts.length} products
      </div>
      {filteredProducts.map((product) => {
        const margin = marginPct(product);
        const showMarginAlarm =
          margin !== null &&
          product.minimal_margin_threshold_percent !== undefined &&
          margin < product.minimal_margin_threshold_percent;
        const typeInfo = getProductTypeInfo(product);
        return (
          <div key={product.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <Badge variant={typeInfo.variant} className="text-xs">
                    {typeInfo.label}
                  </Badge>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                  {showMarginAlarm && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                      <span className="sr-only">
                        Margin below minimal threshold!
                      </span>
                    </>
                  )}
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
                    <span className="font-medium">Price:</span>{" "}
                    {product.price_per_unit ? `€${Number(product.price_per_unit).toFixed(2)}` : "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> {product.cost !== null && product.cost !== undefined ? `€${Number(product.cost).toFixed(2)}` : "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Sales Price:</span> {product.sales_price !== null && product.sales_price !== undefined ? `€${Number(product.sales_price).toFixed(2)}` : "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Margin:</span>{" "}
                    {margin !== null ? (
                      <span className={showMarginAlarm ? "text-red-600 font-bold" : ""}>
                        {margin.toFixed(2)}%
                      </span>
                    ) : "—"}
                  </div>
                  <div>
                    <span className="font-medium">Min Margin:</span>{" "}
                    {product.minimal_margin_threshold_percent !== undefined
                      ? `${Number(product.minimal_margin_threshold_percent).toFixed(2)}%`
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditProduct(product)}
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProduct.isPending}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deactivate</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
