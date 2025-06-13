
import { useState } from "react";
import { Lock, Plus, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskTemplateFormData {
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  weekly_day_of_week?: number;
  monthly_day_of_month?: number;
  quarterly_start_month?: number;
  estimated_duration: number;
  assigned_role: "chef" | "cleaner" | "other";
  favv_compliance: boolean;
  requires_photo: boolean;
}

interface SettingsProps {
  currentLocation: string;
}

const MANAGER_CODE = "9999"; // Manager access code

export function Settings({ currentLocation }: SettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";

  const form = useForm<TaskTemplateFormData>({
    defaultValues: {
      title: "",
      description: "",
      frequency: "weekly",
      estimated_duration: 30,
      assigned_role: "other",
      favv_compliance: false,
      requires_photo: false,
    },
  });

  const handleAuth = () => {
    if (authCode === MANAGER_CODE) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid manager code");
    }
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (data: TaskTemplateFormData) => {
      console.log('Creating new task template:', data);
      const { data: result, error } = await supabase
        .from('cleaning_task_templates')
        .insert({
          title: data.title,
          description: data.description,
          location: dbLocation,
          frequency: data.frequency,
          weekly_day_of_week: data.weekly_day_of_week || null,
          monthly_day_of_month: data.monthly_day_of_month || null,
          quarterly_start_month: data.quarterly_start_month || null,
          estimated_duration: data.estimated_duration,
          assigned_role: data.assigned_role,
          favv_compliance: data.favv_compliance,
          requires_photo: data.requires_photo,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      console.log('Template created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Created",
        description: "New task template has been created successfully.",
      });
      form.reset();
      setShowNewTaskDialog(false);
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

  const onSubmit = (data: TaskTemplateFormData) => {
    createTemplateMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Manager Access Required</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Enter the 4-digit manager code to access settings.
          </p>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter manager code"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              maxLength={4}
            />
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
            <Button onClick={handleAuth} className="w-full">
              Access Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Manager Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm"
        >
          Lock Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Task Templates</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Create and manage recurring cleaning task templates.
          </p>
          
          <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Task Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task Template</DialogTitle>
              </DialogHeader>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequency"
                      rules={{ required: "Frequency is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                            </select>
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
                            <select {...field} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                              <option value="chef">Chef</option>
                              <option value="cleaner">Cleaner</option>
                              <option value="other">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                      onClick={() => setShowNewTaskDialog(false)}
                      disabled={createTemplateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Current Location: {currentLocation === "location1" ? "ToThai Production Facility" : "KHIN Restaurant"}</p>
            <p>Manager Access: Active</p>
            <p>Version: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
