
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ProductList } from "../ProductList";

interface ProductsTabProps {
  productFilter: string;
  setProductFilter: (filter: string) => void;
  onAddNewProduct: () => void;
  onEditProduct: (product: any) => void;
}

export function ProductsTab({ 
  productFilter, 
  setProductFilter, 
  onAddNewProduct, 
  onEditProduct 
}: ProductsTabProps) {
  return (
    <TabsContent value="products" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semi-finished Management</CardTitle>
              <CardDescription>Manage semi-finished products and their specifications</CardDescription>
            </div>
            <Button onClick={onAddNewProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Semi-finished
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter semi-finished products..."
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <ProductList onEditProduct={onEditProduct} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
