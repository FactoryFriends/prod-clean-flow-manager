
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useUnitOptions } from "../shared/UnitOptionsContext";

export function BatchAndUnitFields() {
  const { control } = useFormContext();
  const { innerUnits } = useUnitOptions();
  
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
          required: "Packages per batch is required",
          min: { value: 1, message: "Must be at least 1" },
        }}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Packages per Batch</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5"
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
    </div>
  );
}
