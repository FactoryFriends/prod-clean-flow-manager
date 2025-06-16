
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { IngredientFormData } from "./types";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { useIngredientFormSubmission } from "./IngredientFormSubmission";
import { useIngredientFormFileHandler } from "./IngredientFormFileHandler";
import { useIngredientFormValidation } from "./IngredientFormValidation";
import IngredientSupplierSelect from "./IngredientSupplierSelect";
import IngredientAllergensInput from "./IngredientAllergensInput";
import IngredientFicheUpload from "./IngredientFicheUpload";
import IngredientNameInput from "./IngredientNameInput";
import IngredientSourceSelect from "./IngredientSourceSelect";
import IngredientUnitSizeInput from "./IngredientUnitSizeInput";
import IngredientUnitTypeSelect from "./IngredientUnitTypeSelect";
import IngredientPriceInput from "./IngredientPriceInput";
import IngredientPickableInput from "./IngredientPickableInput";
import SupplierPackagingFields from "../shared/SupplierPackagingFields";
import IngredientCalculatedPrice from "./IngredientCalculatedPrice";

export function IngredientForm() {
  const { innerUnits } = useUnitOptions();
  
  const form = useForm<IngredientFormData>({
    defaultValues: {
      name: "",
      unit_size: 1,
      unit_type: innerUnits[0] || "PIECE",
      supplier_name: "",
      supplier_id: "",
      price_per_unit: 0,
      product_kind: "zelfgemaakt",
      pickable: false,
      allergens: [],
      product_fiche_url: "",
      supplier_package_unit: "",
      units_per_package: undefined,
      inner_unit_type: "",
      price_per_package: undefined,
    },
  });

  const { data: suppliers = [] } = useSuppliers();
  const productType = form.watch("product_kind");
  const selectedSupplierId = form.watch("supplier_id");
  
  // Use custom hooks for different concerns
  const { onSubmit, error } = useIngredientFormSubmission({ form });
  const { ficheFile, uploadingFiche, handleFicheUpload } = useIngredientFormFileHandler({ form });
  const { validateUniqueName } = useIngredientFormValidation();

  // Watch package fields
  const unitsPerPackage = Number(form.watch("units_per_package")) || 1;
  const pricePerPackage = Number(form.watch("price_per_package")) || 0;
  const purchaseUnit = form.watch("supplier_package_unit") || "";
  
  // Get supplier name for display
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const supplierName = selectedSupplier?.name || "your supplier";

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Ingredient</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}
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
            <>
              <IngredientFicheUpload
                control={form.control}
                ficheFile={ficheFile}
                uploadingFiche={uploadingFiche}
                onUpload={handleFicheUpload}
                fieldValue={form.getValues("product_fiche_url")}
              />
              <SupplierPackagingFields 
                control={form.control} 
                show={productType === "extern"} 
                supplierName={supplierName}
              />
              <IngredientCalculatedPrice 
                pricePerPackage={pricePerPackage}
                unitsPerPackage={unitsPerPackage}
                supplierName={supplierName}
                purchaseUnit={purchaseUnit}
              />
            </>
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
