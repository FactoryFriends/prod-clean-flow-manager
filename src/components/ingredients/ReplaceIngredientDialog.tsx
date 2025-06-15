
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ingredient: ingredient to replace
// allIngredients: list of all possible ingredients (active)
// onReplace: function({ newIngredientId })
export function ReplaceIngredientDialog({ open, onOpenChange, ingredient, allIngredients, onReplace }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: any;
  allIngredients: any[];
  onReplace: (newIngredientId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const filteredOptions = allIngredients.filter(
    (i) => i.id !== ingredient.id && i.active
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace Ingredient: <span className="font-bold">{ingredient.name}</span></DialogTitle>
        </DialogHeader>
        <div>
          <label className="block text-sm mb-1">Select replacement ingredient:</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full border rounded px-2 py-2 bg-white"
          >
            <option value="">-- Select --</option>
            {filteredOptions.map(opt => (
              <option value={opt.id} key={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              onReplace(selectedId);
              onOpenChange(false);
            }}
          >
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReplaceIngredientDialog;
