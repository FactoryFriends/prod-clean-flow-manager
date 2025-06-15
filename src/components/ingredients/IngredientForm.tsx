import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { ALLERGENS } from "./constants/allergens";
import type { IngredientFormData } from "./types";
import { useSuppliers } from "@/hooks/useSuppliers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import IngredientSupplierSelect from "./IngredientSupplierSelect";
import IngredientAllergensInput from "./IngredientAllergensInput";
import IngredientFicheUpload from "./IngredientFicheUpload";
const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];

// Extend the form type locally to add new fields if not present in types.ts
type ExtendedIngredientFormData = IngredientFormData & {
  supplier_id?: string;
  product_fiche_url?: string;
};

export function IngredientForm() {
  const form = useForm<ExtendedIngredientFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "KG",
      supplier_name: "",
      supplier_id: "",
      price_per_unit: 0,
      product_kind: "zelfgemaakt",
      pickable: false,
      allergens: [],
      product_fiche_url: "",
    },
  });

  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();
  const { data: suppliers = [] } = useSuppliers();
  const [ficheFile, setFicheFile] = useState<File | null>(null);
  const [uploadingFiche, setUploadingFiche] = useState(false);
  const productType = form.watch("product_kind");

  async function handleFicheUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFiche(true);
    const filePath = `product-fiches/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("public-files")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploadingFiche(false);
      return;
    }
    setFicheFile(file);
    // Instead of direct setValue, use correct name
    form.setValue("product_fiche_url", data?.path || "");
    setUploadingFiche(false);
    toast.success("Product fiche uploaded!");
  }

  // Name uniqueness validation
  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const exists = allProducts.some(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  const onSubmit = (data: ExtendedIngredientFormData) => {
    // Always send allergens array, default to [] if not present
    createProduct.mutate(
      {
        ...data,
        allergens: data.allergens ?? [],
        product_type: "ingredient", // <--- FIXED: ensure correct product_type
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Ingredient</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* NAME (unique) */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required", validate: validateUniqueName }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Scampi 13/15 frozen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRODUCT TYPE */}
          <FormField
            control={form.control}
            name="product_kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="zelfgemaakt">Self-made</option>
                    <option value="extern">Purchased externally</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* PACKAGE SIZE */}
          <FormField
            control={form.control}
            name="unit_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Size</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* UNIT (dropdown) */}
          <FormField
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option value={u} key={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SUPPLIER (dropdown, only extern selectable) */}
          <IngredientSupplierSelect
            control={form.control}
            suppliers={suppliers}
            productKind={productType}
            watch={form.watch}
          />

          {/* PRODUCTFICHE (enkel voor extern product) */}
          {productType === "extern" && (
            <IngredientFicheUpload
              control={form.control}
              ficheFile={ficheFile}
              uploadingFiche={uploadingFiche}
              onUpload={handleFicheUpload}
              fieldValue={form.getValues("product_fiche_url")}
            />
          )}

          {/* PRICE */}
          <FormField
            control={form.control}
            name="price_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per unit (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PICKABLE */}
          <FormField
            control={form.control}
            name="pickable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="mb-0">Pickable for distribution</FormLabel>
              </FormItem>
            )}
          />

          {/* ALLERGENS */}
          <IngredientAllergensInput control={form.control} />

          <Button type="submit" className="w-full">
            Save Ingredient
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
