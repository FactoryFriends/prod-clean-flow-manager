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
import IngredientNameInput from "./IngredientNameInput";
import IngredientSourceSelect from "./IngredientSourceSelect";
import IngredientUnitSizeInput from "./IngredientUnitSizeInput";
import IngredientUnitTypeSelect from "./IngredientUnitTypeSelect";
import IngredientPriceInput from "./IngredientPriceInput";
import IngredientPickableInput from "./IngredientPickableInput";
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

  // --- FIX: set supplier_name per constraint and set product_type to match product_kind
  const onSubmit = (data: ExtendedIngredientFormData) => {
    let updated: ExtendedIngredientFormData & { supplier_name: string } = { ...data, supplier_name: "" };

    if (data.product_kind === "extern") {
      const sup = suppliers.find(s => s.id === data.supplier_id);
      if (!sup) {
        toast.error("Please select a valid supplier before saving an externally purchased ingredient.");
        return; // prevents submission
      }
      updated.supplier_name = sup.name;
    } else {
      updated.supplier_name = "TOTHAI PRODUCTION";
    }

    createProduct.mutate(
      {
        ...updated,
        allergens: data.allergens ?? [],
        product_type: data.product_kind, // <-- FIXED: set product_type in the DB to correct value
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
          <IngredientNameInput control={form.control} validateUniqueName={validateUniqueName} />
          <IngredientSourceSelect control={form.control} />
          <IngredientUnitSizeInput control={form.control} />
          <IngredientUnitTypeSelect control={form.control} />
          <IngredientSupplierSelect
            control={form.control}
            suppliers={suppliers}
            productKind={productType}
            watch={form.watch}
          />
          {productType === "extern" && (
            <IngredientFicheUpload
              control={form.control}
              ficheFile={ficheFile}
              uploadingFiche={uploadingFiche}
              onUpload={handleFicheUpload}
              fieldValue={form.getValues("product_fiche_url")}
            />
          )}
          <IngredientPriceInput control={form.control} />
          <IngredientPickableInput control={form.control} />
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
