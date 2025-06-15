
import React, { useState } from "react";
import { useAllProducts, useUpdateProduct } from "@/hooks/useProductionData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { BadgeDollarSign } from "lucide-react";

// Helper: Calculate margin for a dish/semi-finished item
function calcMargin(cost: number, salesPrice: number) {
  if (!salesPrice || salesPrice <= 0) return null;
  return ((salesPrice - cost) / salesPrice) * 100;
}

export function IngredientPriceManager() {
  const { data: allProducts = [], refetch } = useAllProducts();
  const updateProduct = useUpdateProduct();
  const [editingPrice, setEditingPrice] = useState<{[id: string]: string}>({});

  // Get all active ingredients
  const ingredients = allProducts.filter(
    p =>
      p.active &&
      (
        p.product_type === "ingredient" ||
        p.product_kind === "ingredient" ||
        p.product_kind === "extern"
      )
  );

  // All semi-finished and dishes
  const semiFinishedAndDishes = allProducts.filter(
    p =>
      p.active &&
      (
        p.product_type === "semi-finished" ||
        p.product_type === "dish" ||
        p.product_kind === "semi-finished" ||
        p.product_kind === "dish"
      )
  );

  // Dishes/semi-finished below margin threshold
  const marginAlerts = semiFinishedAndDishes
    .map(p => {
      const marginPercent = calcMargin(Number(p.cost ?? 0), Number(p.sales_price ?? 0));
      return {
        product: p,
        margin: marginPercent,
        threshold: Number(p.minimal_margin_threshold_percent ?? 25)
      };
    })
    .filter(row => row.margin !== null && row.margin < row.threshold);

  // Handler to add new price
  const handleAddPrice = (ingredientId: string) => {
    const newPrice = Number(editingPrice[ingredientId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    updateProduct.mutate(
      { id: ingredientId, price_per_unit: newPrice, cost: newPrice },
      {
        onSuccess: () => {
          toast.success("Price updated!");
          setEditingPrice(prev => ({ ...prev, [ingredientId]: "" }));
          refetch();
        }
      }
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <BadgeDollarSign className="w-6 h-6" /> Ingredient Prices
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Current Price&nbsp;(&euro;)</TableHead>
              <TableHead>New Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map(ing => (
              <TableRow key={ing.id}>
                <TableCell>{ing.name}</TableCell>
                <TableCell>
                  {typeof ing.price_per_unit === "number"
                    ? ing.price_per_unit.toFixed(2)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPrice[ing.id] || ""}
                    placeholder="Enter new price"
                    className="max-w-[100px]"
                    onChange={e =>
                      setEditingPrice(prev => ({
                        ...prev,
                        [ing.id]: e.target.value
                      }))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleAddPrice(ing.id)}
                    disabled={!editingPrice[ing.id]}
                  >
                    Add Price
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-xs mt-2 text-muted-foreground">
          Changing the price will immediately be used for new calculations and margin reports. All price changes are stored in cost history.
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mt-8 mb-3 text-red-700">
          Margin Alerts: Dishes & Semi-finished Products Below Threshold
        </h3>
        {marginAlerts.length === 0 && (
          <div className="p-2 rounded bg-green-50 text-green-700 border border-green-200">
            No dishes or semi-finished products are below their minimal margin threshold.
          </div>
        )}
        {marginAlerts.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Sales Price</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead>Minimal Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marginAlerts.map(alert => (
                <TableRow key={alert.product.id}>
                  <TableCell>{alert.product.name}</TableCell>
                  <TableCell>
                    {typeof alert.product.cost === "number"
                      ? alert.product.cost.toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {typeof alert.product.sales_price === "number"
                      ? alert.product.sales_price.toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-red-700 font-bold">
                    {alert.margin !== null ? alert.margin.toFixed(2) + "%" : "—"}
                  </TableCell>
                  <TableCell>
                    {alert.threshold.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default IngredientPriceManager;
