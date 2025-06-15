import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { toast } from "sonner";
import { ALLERGENS, ALLERGENS_ENGLISH } from "./constants/allergens";
import type { IngredientFormData } from "./types";
import { useSuppliers } from "@/hooks/useSuppliers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];

export function IngredientForm() {
  const form = useForm<IngredientFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: "KG",
      supplier_name: "",
      price_per_unit: 0,
      product_kind: "zelfgemaakt",
      pickable: false,
      allergens: [],
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
    form.setValue("product_fiche_url", data?.path);
    setUploadingFiche(false);
    toast.success("Product fiche uploaded!");
  }

  // Validatie voor unieke naam (case-insensitive)
  function validateUniqueName(value: string) {
    if (!allProducts) return true; // Lijst nog niet geladen
    const exists = allProducts.some(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  const onSubmit = (data: IngredientFormData) => {
    createProduct.mutate(
      {
        name: data.name,
        unit_size: Number(data.unit_size),
        unit_type: data.unit_type,
        supplier_name: data.supplier_name || null,
        price_per_unit: Number(data.price_per_unit) || null,
        packages_per_batch: 1,
        shelf_life_days: null,
        product_type: data.product_kind,
        product_kind: data.product_kind,
        pickable: Boolean(data.pickable),
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
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    disabled={form.watch("product_kind") === "zelfgemaakt"}
                    required={form.watch("product_kind") === "extern"}
                  >
                    <option value="">
                      {form.watch("product_kind") === "extern"
                        ? "Select supplier…"
                        : "TOTHAI PRODUCTION"}
                    </option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRODUCTFICHE (enkel voor extern product) */}
          {productType === "extern" && (
            <div>
              <FormLabel>Product fiche (optional)</FormLabel>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFicheUpload}
                disabled={uploadingFiche}
                className="block"
              />
              {form.watch("product_fiche_url") && (
                <a
                  href={`https://dtfhwnvclwbknycmcejb.supabase.co/storage/v1/object/public/public-files/${form.watch("product_fiche_url")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary text-xs underline mt-1"
                >
                  Bekijk/upload productfiche
                </a>
              )}
            </div>
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
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="mb-0">Pickable for distribution</FormLabel>
              </FormItem>
            )}
          />

          {/* ALLERGENS */}
          <FormField
            control={form.control}
            name="allergens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergens</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((a) => (
                    <label
                      key={a.english}
                      className="flex items-center gap-1 text-xs bg-gray-50 border rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={field.value?.includes(a.english)}
                        onChange={() => {
                          if (field.value?.includes(a.english)) {
                            field.onChange(field.value.filter((val) => val !== a.english));
                          } else {
                            field.onChange([...(field.value || []), a.english]);
                          }
                        }}
                      />
                      {a.english} / {a.dutch}
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Ingredient
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
