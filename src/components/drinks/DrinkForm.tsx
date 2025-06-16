
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCreateProduct, useAllProducts } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { toast } from "sonner";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { DrinkFormFields } from "./DrinkFormFields";
import { DrinkPricingFields } from "./DrinkPricingFields";
import { DrinkFormData, defaultDrinkFormValues } from "./DrinkFormData";

interface DrinkFormProps {
  onSuccess?: () => void;
}

export function DrinkForm({ onSuccess }: DrinkFormProps) {
  const form = useForm<DrinkFormData>({
    defaultValues: defaultDrinkFormValues,
  });

  const { innerUnits } = useUnitOptions();
  const [error, setError] = React.useState<string | null>(null);

  const createProduct = useCreateProduct();
  const { data: suppliers = [] } = useSuppliers();

  const selectedSupplierId = form.watch("supplier_id");
  const unitsPerPackage = Number(form.watch("units_per_package")) || 1;
  const pricePerPackage = Number(form.watch("price_per_package")) || 0;

  // Get supplier name for display
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const supplierName = selectedSupplier?.name || "your supplier";

  // Auto-populate price_per_unit when packaging calculation is available
  React.useEffect(() => {
    if (pricePerPackage > 0 && unitsPerPackage > 0) {
      const calculatedPrice = pricePerPackage / unitsPerPackage;
      form.setValue("price_per_unit", calculatedPrice);
      form.setValue("cost", calculatedPrice);
    }
  }, [pricePerPackage, unitsPerPackage, form]);

  const cost = Number(form.watch("cost")) || 0;
  const markupPercent = Number(form.watch("markup_percent")) || 0;
  const fixedSalesPrice = Number(form.watch("sales_price")) || 0;

  const calculatedSalesPrice = cost + (cost * markupPercent / 100);
  const deltaSalesPrice = calculatedSalesPrice - fixedSalesPrice;
  const deltaColor = deltaSalesPrice >= 0 ? "text-green-700" : "text-red-600";

  const onSubmit = (data: DrinkFormData) => {
    setError(null);
    
    if (!data.unit_type || !innerUnits.map(u => u.toUpperCase()).includes((data.unit_type + '').toUpperCase())) {
      setError("Unit type must be selected from the dropdown.");
      return;
    }
    if (data.units_per_package !== undefined && Number(data.units_per_package) <= 0) {
      setError("Units per package must be greater than 0 if set.");
      return;
    }
    
    if (data.supplier_id && suppliers.length) {
      const sup = suppliers.find((s) => s.id === data.supplier_id);
      if (!sup) {
        setError("Supplier must be selected from the list.");
        return;
      }
      data.supplier_id = sup.id;
    }

    createProduct.mutate(
      {
        ...data,
        product_type: "drink",
        unit_type: data.unit_type.toUpperCase(),
        cost: Number(data.cost) || 0,
        markup_percent: Number(data.markup_percent) || 0,
        sales_price: Number(data.sales_price) || 0,
        supplier_package_unit: data.supplier_package_unit ? data.supplier_package_unit.toUpperCase() : undefined,
        inner_unit_type: data.inner_unit_type ? data.inner_unit_type.toUpperCase() : undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <div className="bg-white border p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Add Drink</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DrinkFormFields
            control={form.control}
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            supplierName={supplierName}
            pricePerPackage={pricePerPackage}
            unitsPerPackage={unitsPerPackage}
          />

          <DrinkPricingFields
            control={form.control}
            cost={cost}
            markupPercent={markupPercent}
            calculatedSalesPrice={calculatedSalesPrice}
            deltaSalesPrice={deltaSalesPrice}
            deltaColor={deltaColor}
          />

          <Button type="submit" className="w-full">
            Save Drink
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default DrinkForm;
