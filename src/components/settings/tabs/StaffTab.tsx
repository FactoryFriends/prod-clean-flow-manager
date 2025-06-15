
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { StaffCodeList } from "../StaffCodeList";

interface StaffTabProps {
  staffCodeFilter: string;
  setStaffCodeFilter: (filter: string) => void;
  onAddNewStaffCode: () => void;
  onEditStaffCode: (staffCode: any) => void;
}

export function StaffTab({ 
  staffCodeFilter, 
  setStaffCodeFilter, 
  onAddNewStaffCode, 
  onEditStaffCode 
}: StaffTabProps) {
  return (
    <TabsContent value="staff" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Code Management</CardTitle>
              <CardDescription>Manage staff codes and permissions</CardDescription>
            </div>
            <Button onClick={onAddNewStaffCode} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Staff Code
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter staff codes..."
              value={staffCodeFilter}
              onChange={(e) => setStaffCodeFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <StaffCodeList onEditStaffCode={onEditStaffCode} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
