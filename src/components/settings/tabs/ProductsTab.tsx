
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";
import { ProductList } from "../ProductList";
import { useAllProducts } from "@/hooks/useProductionData";
import { exportSemiFinishedToExcel } from "../excel/semiFinishedExporter";

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
  const { data: allProducts = [] } = useAllProducts();
  
  const semiFinished = allProducts.filter(
    (p) => (p as any).product_kind === "zelfgemaakt" && (p as any).product_type !== "dish"
  );

  const handleExport = () => {
    exportSemiFinishedToExcel(semiFinished as any);
  };

  return (
    <TabsContent value="products" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semi-finished Management</CardTitle>
              <CardDescription>Manage semi-finished products and their specifications</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
              <Button onClick={onAddNewProduct} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Semi-finished
              </Button>
            </div>
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
