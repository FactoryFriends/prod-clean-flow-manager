
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Replace } from "lucide-react"; // Changed import
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
              <td className="p-2 flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label="Edit">
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
                      onClick={() => onDeactivate(item)}
                      disabled={!item.active}
                      aria-label="Deactivate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deactivate</TooltipContent>
                </Tooltip>
                {type === "ingredient" && onReplace && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReplace(item)}
                        aria-label="Replace"
                      >
                        <Replace className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Replace</TooltipContent>
                  </Tooltip>
                )}
                {type === "ingredient" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm(
                            `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone and may affect any recipes using this ingredient.`
                          )) {
                            onPermanentlyDelete && onPermanentlyDelete(item);
                          }
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
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

