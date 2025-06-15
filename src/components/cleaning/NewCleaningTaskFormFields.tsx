
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewTaskFormData {
  title: string;
  description: string;
  scheduled_date: string;
  due_time: string;
  estimated_duration: number;
  favv_compliance: boolean;
}

interface NewCleaningTaskFormFieldsProps {
  control: Control<NewTaskFormData>;
}

export function NewCleaningTaskFormFields({ control }: NewCleaningTaskFormFieldsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <FormField
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isMobile ? "Title" : "Task Title"}</FormLabel>
            <FormControl>
              <Input placeholder={isMobile ? "Title" : "Enter task title"} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={isMobile ? "Description" : "Enter task description"} 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="scheduled_date"
          rules={{ required: "Scheduled date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isMobile ? "Date" : "Scheduled Date"}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="due_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isMobile ? "Time" : "Due Time (Optional)"}</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="estimated_duration"
        rules={{ 
          required: "Estimated duration is required",
          min: { value: 1, message: "Duration must be at least 1 minute" }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isMobile ? "Duration (min)" : "Estimated Duration (minutes)"}</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="30"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="favv_compliance"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 rounded border border-input"
              />
            </FormControl>
            <FormLabel className="text-sm font-normal">
              {isMobile ? "FAVV Required" : "FAVV Compliance Required"}
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
