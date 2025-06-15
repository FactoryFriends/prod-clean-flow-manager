
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CustomerManagement } from "../CustomerManagement";

interface CustomersTabProps {
  customerFilter: string;
  setCustomerFilter: (filter: string) => void;
}

export function CustomersTab({ customerFilter, setCustomerFilter }: CustomersTabProps) {
  return (
    <TabsContent value="customers" className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>Manage customer information and delivery details</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter customers..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <CustomerManagement />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
