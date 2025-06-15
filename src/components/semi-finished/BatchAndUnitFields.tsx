
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UNIT_OPTIONS, formatNumberComma } from "./semifinishedFormUtils";

export function BatchAndUnitFields() {
  const { control, watch } = useFormContext();
  // No other state here – all logic in main form
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
                type="text"
                inputMode="decimal"
                {...field}
                value={formatNumberComma(field.value)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d,]/g, "");
                  field.onChange(cleaned);
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
                type="text"
                inputMode="numeric"
                {...field}
                value={formatNumberComma(field.value)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d,]/g, "");
                  field.onChange(cleaned);
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
