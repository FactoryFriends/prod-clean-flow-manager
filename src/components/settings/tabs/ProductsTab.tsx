
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Coffee, ShoppingCart, Utensils, FlaskConical } from "lucide-react";
import { ProductList } from "../ProductList";

interface ProductsTabProps {
  productFilter: string;
  setProductFilter: (filter: string) => void;
  productTypeFilter: string;
  setProductTypeFilter: (filter: string) => void;
  onAddNewProduct: () => void;
  onEditProduct: (product: any) => void;
}

export function ProductsTab({ 
  productFilter, 
  setProductFilter,
  productTypeFilter,
  setProductTypeFilter,
  onAddNewProduct, 
  onEditProduct 
}: ProductsTabProps) {
  const productTypes = [
    { id: "all", label: "All Products", icon: Package, count: 0 },
    { id: "semi-finished", label: "Semi-finished", icon: FlaskConical, count: 0 },
    { id: "external", label: "External Products", icon: ShoppingCart, count: 0 },
    { id: "ingredient", label: "Ingredients", icon: Package, count: 0 },
    { id: "dish", label: "Dishes", icon: Utensils, count: 0 },
    { id: "drink", label: "Drinks", icon: Coffee, count: 0 },
  ];
  return (
    <TabsContent value="products" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage products and their specifications</CardDescription>
            </div>
            <Button onClick={onAddNewProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Type Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {productTypes.map((type) => {
              const Icon = type.icon;
              const isActive = productTypeFilter === type.id;
              return (
                <Button
                  key={type.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setProductTypeFilter(type.id)}
                  className="flex flex-col items-center gap-2 h-auto py-4 px-3"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {type.label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Product List */}
          <ProductList 
            onEditProduct={onEditProduct} 
            typeFilter={productTypeFilter}
            searchFilter={productFilter}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
