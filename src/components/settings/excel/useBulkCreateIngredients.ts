
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBulkCreateIngredients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ingredients: any[]) => {
      const results = [];
      const errors = [];
      const suppliersCreated = new Set<string>();
      
      for (const ingredient of ingredients) {
        try {
          let supplierId = null;
          
          // Handle supplier for external products
          if (ingredient.product_type === 'extern' && ingredient.supplier_name) {
            // Check if supplier exists
            const { data: existingSuppliers } = await supabase
              .from('suppliers')
              .select('id, name')
              .eq('name', ingredient.supplier_name)
              .limit(1);
            
            if (existingSuppliers && existingSuppliers.length > 0) {
              supplierId = existingSuppliers[0].id;
            } else {
              // Create new supplier
              const { data: newSupplier, error: supplierError } = await supabase
                .from('suppliers')
                .insert({
                  name: ingredient.supplier_name,
                  active: true
                })
                .select('id')
                .single();
              
              if (supplierError) throw supplierError;
              
              supplierId = newSupplier.id;
              suppliersCreated.add(ingredient.supplier_name);
            }
          }
          
          // Prepare the ingredient data for database
          const ingredientData = {
            name: ingredient.name,
            supplier_name: ingredient.supplier_name || (ingredient.product_type === 'zelfgemaakt' ? 'TOTHAI PRODUCTION' : null),
            supplier_id: supplierId,
            supplier_package_unit: ingredient.supplier_package_unit,
            price_per_package: ingredient.price_per_package,
            units_per_package: ingredient.units_per_package,
            inner_unit_type: ingredient.inner_unit_type,
            allergens: ingredient.allergens || [],
            pickable: ingredient.pickable,
            product_type: ingredient.product_type,
            active: true,
            unit_size: 1, // Default value
            unit_type: ingredient.inner_unit_type,
            packages_per_batch: 1, // Default value
            // Calculate cost per unit
            cost: ingredient.price_per_package / ingredient.units_per_package,
            price_per_unit: ingredient.price_per_package / ingredient.units_per_package
          };
          
          const { data, error } = await supabase
            .from("products")
            .insert(ingredientData)
            .select()
            .single();
          
          if (error) throw error;
          
          // Track cost history
          if (ingredientData.cost) {
            await supabase
              .from("product_cost_history")
              .insert({
                product_id: data.id,
                old_cost: null,
                new_cost: ingredientData.cost,
                changed_by: "excel_import",
              });
          }
          
          results.push(data);
        } catch (error) {
          console.error(`Failed to import ingredient ${ingredient.name}:`, error);
          errors.push({
            name: ingredient.name,
            error: error.message || "Unknown error"
          });
        }
      }
      
      return { results, errors, suppliersCreated: Array.from(suppliersCreated) };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["all-suppliers"] });
      
      const { results, errors, suppliersCreated } = data;
      
      if (results.length > 0) {
        toast.success(`Successfully imported ${results.length} ingredient(s)`);
      }
      
      if (suppliersCreated.length > 0) {
        toast.success(`Created ${suppliersCreated.length} new supplier(s): ${suppliersCreated.join(', ')}`);
      }
      
      if (errors.length > 0) {
        toast.error(`Failed to import ${errors.length} ingredient(s). Check console for details.`);
        console.error("Import errors:", errors);
      }
    },
    onError: (error) => {
      toast.error("Bulk import failed: " + error.message);
    },
  });
};
