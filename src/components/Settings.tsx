import { useState } from "react";
import { Lock, Plus, Package, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskTemplateFormData {
  title: string;
  description: string;
  location: "tothai" | "khin" | "both";
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
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskTemplateFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "tothai",
      frequency: "weekly",
      estimated_duration: 30,
      assigned_role: "other",
      favv_compliance: false,
      requires_photo: false,
    },
  });

  // Fetch existing task templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['cleaning-task-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaning_task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
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
      setEditingTemplate(null);
      form.reset();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cleaning_task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: "Template Deleted",
        description: "Task template has been deleted successfully.",
      });
    },
  });

  const onSubmit = (data: TaskTemplateFormData) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    form.reset({
      title: template.title,
      description: template.description || "",
      location: template.location,
      frequency: template.frequency,
      weekly_day_of_week: template.weekly_day_of_week,
      monthly_day_of_month: template.monthly_day_of_month,
      quarterly_start_month: template.quarterly_start_month,
      estimated_duration: template.estimated_duration,
      assigned_role: template.assigned_role,
      favv_compliance: template.favv_compliance,
      requires_photo: template.requires_photo,
    });
    setShowNewTaskDialog(true);
  };

  const handleDelete = (template: any) => {
    if (confirm(`Are you sure you want to delete "${template.title}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Task Templates</h2>
            </div>
            
            <Dialog open={showNewTaskDialog} onOpenChange={(open) => {
              setShowNewTaskDialog(open);
              if (!open) {
                setEditingTemplate(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Task Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "Edit Task Template" : "Create New Task Template"}
                  </DialogTitle>
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
                                  <SelectItem value="other">Other</SelectItem>
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
                        onClick={() => {
                          setShowNewTaskDialog(false);
                          setEditingTemplate(null);
                          form.reset();
                        }}
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
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {templatesLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No task templates found. Create your first template to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.title}</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {template.location === 'tothai' ? 'ToThai' : template.location === 'khin' ? 'KHIN' : 'Both Locations'}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {template.frequency}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {template.assigned_role}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {template.estimated_duration}min
                      </span>
                      {template.favv_compliance && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                          FAVV
                        </span>
                      )}
                      {template.requires_photo && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Photo Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Current Location: {currentLocation === "tothai" ? "ToThai Production Facility" : "KHIN Restaurant"}</p>
            <p>Manager Access: Active</p>
            <p>Version: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
