
import React from "react";
import { Button } from "@/components/ui/button";

function ProductList({
  products,
  type,
  onEdit,
  onDeactivate,
  onReplace,
  onPermanentlyDelete,
}: {
  products: any[];
  type: string;
  onEdit: (product: any) => void;
  onDeactivate: (product: any) => void;
  onReplace?: (product: any) => void;
  onPermanentlyDelete?: (product: any) => void;
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
                {type === "ingredient" && onReplace && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onReplace(item)}
                  >
                    REPLACE
                  </Button>
                )}
                {type === "ingredient" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(
                        `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone and may affect any recipes using this ingredient.`
                      )) {
                        onPermanentlyDelete && onPermanentlyDelete(item);
                      }
                    }}
                  >
                    DELETE
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
