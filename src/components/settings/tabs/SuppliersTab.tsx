
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { SuppliersManagement } from "../SuppliersManagement";
import { RoleGuard } from "@/components/auth/RoleGuard";

export function SuppliersTab() {
  return (
    <TabsContent value="suppliers" className="space-y-4">
      <RoleGuard allowedRoles={['admin']}>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Management</CardTitle>
            <CardDescription>
              Manage your suppliers and their contact information. This data is restricted to admin users only for security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuppliersManagement />
          </CardContent>
        </Card>
      </RoleGuard>
    </TabsContent>
  );
}
