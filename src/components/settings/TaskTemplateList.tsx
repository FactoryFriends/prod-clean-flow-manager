
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskTemplateListProps {
  onEditTemplate: (template: any) => void;
}

export function TaskTemplateList({ onEditTemplate }: TaskTemplateListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { data: result, error } = await supabase
        .from('cleaning_task_templates')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-task-templates'] });
      toast({
        title: result.active ? "Template Activated" : "Template Deactivated",
        description: `Task template has been ${result.active ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Failed to toggle template status:', error);
      toast({
        title: "Error",
        description: "Failed to update template status. Please try again.",
        variant: "destructive",
      });
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
    onError: (error) => {
      console.error('Failed to delete template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (template: any) => {
    toggleActiveMutation.mutate({ id: template.id, active: !template.active });
  };

  const handleDelete = (template: any) => {
    if (confirm(`Are you sure you want to permanently delete "${template.title}"? This action cannot be undone.`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  if (templatesLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No task templates found. Create your first template to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {templates.map((template) => (
        <div key={template.id} className={`border border-border rounded-lg p-4 space-y-2 ${!template.active ? 'opacity-60 bg-muted/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{template.title}</h3>
              {!template.active && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleToggleActive(template)}
                disabled={toggleActiveMutation.isPending}
                className={template.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
              >
                {template.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditTemplate(template)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(template)}
                disabled={deleteTemplateMutation.isPending}
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
  );
}
