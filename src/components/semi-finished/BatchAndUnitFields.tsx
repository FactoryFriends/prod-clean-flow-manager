
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useUnitOptions } from "../shared/UnitOptionsContext";
import { Package } from "lucide-react";

export function BatchAndUnitFields() {
  const { control, watch } = useFormContext();
  const { innerUnits } = useUnitOptions();
  
  const variablePackaging = watch("variable_packaging");
  
  console.log("BatchAndUnitFields - innerUnits:", innerUnits);
  
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <FormField
        control={control}
        name="batch_size"
        rules={{ required: "Batch size is required" }}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Batch Size</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 20"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? "" : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="batch_unit"
        render={({ field }) => (
          <FormItem className="w-32">
            <FormLabel>Batch Unit</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                {innerUnits.map((u) => (
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
      <FormField
        control={control}
        name="packages_per_batch"
        rules={{
          required: !variablePackaging ? "Packages per batch is required" : false,
          min: !variablePackaging ? { value: 1, message: "Must be at least 1" } : undefined,
        }}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel className="flex items-center gap-2">
              Packages per Batch
              <div className="flex items-center gap-2 ml-auto">
                <Package className="w-4 h-4" />
                <FormField
                  control={control}
                  name="variable_packaging"
                  render={({ field: variableField }) => (
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={!!variableField.value}
                        onCheckedChange={variableField.onChange}
                      />
                      <span className="text-xs text-muted-foreground">Variable</span>
                    </div>
                  )}
                />
              </div>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder={variablePackaging ? "Variable quantity per batch" : "e.g. 5"}
                disabled={variablePackaging}
                {...field}
                value={variablePackaging ? "" : (field.value || "")}
                onChange={(e) => {
                  if (!variablePackaging) {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : Number(value));
                  }
                }}
                className={variablePackaging ? "bg-muted cursor-not-allowed" : ""}
              />
            </FormControl>
            {variablePackaging && (
              <p className="text-xs text-muted-foreground italic">
                When variable packaging is enabled, users specify quantity per package when creating batches
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
