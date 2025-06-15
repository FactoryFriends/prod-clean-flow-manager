
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TaskTemplateFormFields } from "./TaskTemplateFormFields";
import { useTaskTemplateMutations, TaskTemplateFormData } from "./useTaskTemplateMutations";

interface TaskTemplateFormProps {
  editingTemplate?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskTemplateForm({ editingTemplate, onSuccess, onCancel }: TaskTemplateFormProps) {
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

  const { createTemplate, updateTemplate } = useTaskTemplateMutations({
    onSuccess,
    form,
  });

  const onSubmit = (data: TaskTemplateFormData) => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplate.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TaskTemplateFormFields
          control={form.control}
          watchedFrequency={form.watch("frequency")}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            {createTemplate.isPending || updateTemplate.isPending
              ? "Saving..."
              : editingTemplate
                ? "Update Template"
                : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
