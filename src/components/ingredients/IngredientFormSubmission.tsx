
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useCreateProduct } from "@/hooks/useProductionData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import type { IngredientFormData } from "./types";

interface IngredientFormSubmissionProps {
  form: UseFormReturn<IngredientFormData>;
}

export function useIngredientFormSubmission({ form }: IngredientFormSubmissionProps) {
  const { innerUnits } = useUnitOptions();
  const createProduct = useCreateProduct();
  const { data: suppliers = [] } = useSuppliers();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (data: IngredientFormData) => {
    setError(null);

    // Validate units and package units
    if (!data.unit_type || !innerUnits.map(u => u.toUpperCase()).includes((data.unit_type + '').toUpperCase())) {
      setError("Unit type must be selected from the dropdown.");
      return;
    }
    if (Number(data['units_per_package']) <= 0) {
      setError("Units per package must be greater than 0.");
      return;
    }

    if (data.product_kind === "extern") {
      const sup = suppliers.find(s => s.id === data.supplier_id);
      if (!sup) {
        toast.error("Please select a valid supplier before saving an externally purchased ingredient.");
        return;
      }
      if (!sup.name || sup.name.trim() === "") {
        toast.error("Selected supplier has no name. Please update supplier information.");
        return;
      }
    }

    let updated: IngredientFormData & { supplier_name: string } = { 
      ...data, 
      supplier_name: data.product_kind === "extern" 
        ? suppliers.find(s => s.id === data.supplier_id)?.name.trim() || ""
        : "TOTHAI PRODUCTION"
    };
    
    // Additional safety check for external products
    if (data.product_kind === "extern" && !updated.supplier_name) {
      toast.error("Supplier name is required for external products.");
      return;
    }

    createProduct.mutate(
      {
        ...updated,
        allergens: data.allergens ?? [],
        product_type: data.product_kind,
        unit_type: data.unit_type.toUpperCase(),
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return { onSubmit, error };
}
