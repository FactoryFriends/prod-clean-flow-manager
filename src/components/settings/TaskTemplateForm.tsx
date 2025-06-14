import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

interface TaskTemplateFormProps {
  editingTemplate?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskTemplateForm({ editingTemplate, onSuccess, onCancel }: TaskTemplateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskTemplateFormData>({
    defaultValues: {
      title: editingTemplate?.title || "",
      description: editingTemplate?.description || "",
      location: editingTemplate?.location || "tothai",
      frequency: editingTemplate?.frequency || "weekly",
      weekly_day_of_week: editingTemplate?.weekly_day_of_week,
      monthly_day_of_month: editingTemplate?.monthly_day_of_month,
      quarterly_start_month: editingTemplate?.quarterly_start_month,
      estimated_duration: editingTemplate?.estimated_duration || 30,
      assigned_role: editingTemplate?.assigned_role || "cleaner",
      favv_compliance: editingTemplate?.favv_compliance || false,
      requires_photo: editingTemplate?.requires_photo || false,
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: TaskTemplateFormData) => {
      console.log('Creating new task template:', data);
      
      // If location is "both", create templates for both locations
      if (data.location === "both") {
        const locations = ["tothai", "khin"] as const;
        const results = [];
        
        for (const loc of locations) {
          const { data: result, error } = await supabase
            .from('cleaning_task_templates')
            .insert({
              title: data.title,
              description: data.description,
              location: loc,
              frequency: data.frequency,
              weekly_day_of_week: data.weekly_day_of_week || null,
              monthly_day_of_month: data.monthly_day_of_month || null,
              quarterly_start_month: data.quarterly_start_month || null,
              estimated_duration: data.estimated_duration,
              assigned_role: data.assigned_role,
              favv_compliance: data.favv_compliance,
              requires_photo: data.requires_photo,
              active: true,
            })
            .select()
            .single();

          if (error) throw error;
          results.push(result);
        }
        return results;
      } else {
        const { data: result, error } = await supabase
          .from('cleaning_task_templates')
          .insert({
            title: data.title,
            description: data.description,
            location: data.location,
            frequency: data.frequency,
            weekly_day_of_week: data.weekly_day_of_week || null,
            monthly_day_of_month: data.monthly_day_of_month || null,
            quarterly_start_month: data.quarterly_start_month || null,
            estimated_duration: data.estimated_duration,
            assigned_role: data.assigned_role,
            favv_compliance: data.favv_compliance,
            requires_photo: data.requires_photo,
            active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return [result];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Created",
        description: "New task template has been created successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create task template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: TaskTemplateFormData }) => {
      // For updates, we only update the single template (no "both" logic for edits)
      const locationValue = data.location === "both" ? "tothai" : data.location;
      
      const { data: result, error } = await supabase
        .from('cleaning_task_templates')
        .update({
          title: data.title,
          description: data.description,
          location: locationValue,
          frequency: data.frequency,
          weekly_day_of_week: data.weekly_day_of_week || null,
          monthly_day_of_month: data.monthly_day_of_month || null,
          quarterly_start_month: data.quarterly_start_month || null,
          estimated_duration: data.estimated_duration,
          assigned_role: data.assigned_role,
          favv_compliance: data.favv_compliance,
          requires_photo: data.requires_photo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Updated",
        description: "Task template has been updated successfully.",
      });
      onSuccess();
    },
  });

  const onSubmit = (data: TaskTemplateFormData) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
        {form.watch("frequency") === "weekly" && (
          <FormField
            control={form.control}
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

        {form.watch("frequency") === "monthly" && (
          <FormField
            control={form.control}
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

        {form.watch("frequency") === "quarterly" && (
          <FormField
            control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            control={form.control}
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          >
            {createTemplateMutation.isPending || updateTemplateMutation.isPending ? 
              "Saving..." : 
              editingTemplate ? "Update Template" : "Create Template"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
