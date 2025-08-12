import { TabsContent } from "@/components/ui/tabs";
import { UserManagement } from "../UserManagement";

export function UsersTab() {
  return (
    <TabsContent value="users" className="space-y-4">
      <UserManagement />
    </TabsContent>
  );
}