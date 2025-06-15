
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SuppliersManagement } from "../SuppliersManagement";

export function SuppliersTab() {
  return (
    <TabsContent value="suppliers" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Management</CardTitle>
          <CardDescription>Manage your masterdata suppliers (create, edit, deactivate).</CardDescription>
        </CardHeader>
        <CardContent>
          <SuppliersManagement />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
