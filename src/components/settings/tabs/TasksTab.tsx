
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TaskTemplateList } from "../TaskTemplateList";

interface TasksTabProps {
  templateFilter: string;
  setTemplateFilter: (filter: string) => void;
  onAddNewTemplate: () => void;
  onEditTemplate: (template: any) => void;
}

export function TasksTab({ 
  templateFilter, 
  setTemplateFilter, 
  onAddNewTemplate, 
  onEditTemplate 
}: TasksTabProps) {
  return (
    <TabsContent value="tasks" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Template Management</CardTitle>
              <CardDescription>Manage cleaning task templates</CardDescription>
            </div>
            <Button onClick={onAddNewTemplate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter templates..."
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <TaskTemplateList onEditTemplate={onEditTemplate} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
