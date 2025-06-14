
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface TaskTemplateFormData {
  title: string;
  description: string;
  location: "tothai" | "khin" | "both";
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  weekly_day_of_week?: number;
  monthly_day_of_month?: number;
  quarterly_start_month?: number;
  estimated_duration: number;
  assigned_role: "chef" | "cleaner";
  favv_compliance: boolean;
  requires_photo: boolean;
}

interface TaskTemplateFormFieldsProps {
  control: Control<TaskTemplateFormData>;
  watchedFrequency: string;
}

export function TaskTemplateFormFields({ control, watchedFrequency }: TaskTemplateFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter task title" {...field} />
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
                placeholder="Enter task description" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="location"
          rules={{ required: "Location is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tothai">ToThai Production</SelectItem>
                    <SelectItem value="khin">KHIN Restaurant</SelectItem>
                    <SelectItem value="both">Both Locations</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="frequency"
          rules={{ required: "Frequency is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="assigned_role"
          rules={{ required: "Role is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Role</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Frequency-specific fields */}
      {watchedFrequency === "weekly" && (
        <FormField
          control={control}
          name="weekly_day_of_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <FormControl>
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                    <SelectItem value="7">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {watchedFrequency === "monthly" && (
        <FormField
          control={control}
          name="monthly_day_of_month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Month (1-31)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="31"
                  placeholder="Enter day of month"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {watchedFrequency === "quarterly" && (
        <FormField
          control={control}
          name="quarterly_start_month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Month</FormLabel>
              <FormControl>
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select starting month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="estimated_duration"
        rules={{ 
          required: "Estimated duration is required",
          min: { value: 1, message: "Duration must be at least 1 minute" }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Duration (minutes)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="30"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                FAVV Compliance Required
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requires_photo"
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
                Photo Required
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
