
import { useState } from "react";
import { Edit, Trash2, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomers, useDeleteCustomer, Customer } from "@/hooks/useCustomers";
import { CustomerForm } from "./CustomerForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CustomerList() {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: customers = [], isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCustomer.mutate(id);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const getCustomerTypeIcon = (type: string) => {
    return type === "restaurant" ? <Building2 className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getCustomerTypeBadge = (type: string) => {
    return type === "restaurant" ? "default" : "secondary";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading customers...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No customers found. Create your first customer to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <Badge 
                      variant={getCustomerTypeBadge(customer.customer_type)}
                      className="flex items-center gap-1"
                    >
                      {getCustomerTypeIcon(customer.customer_type)}
                      {customer.customer_type === "restaurant" ? "Restaurant" : "External"}
                    </Badge>
                    <Badge variant={customer.active ? "default" : "secondary"}>
                      {customer.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {customer.contact_person && (
                      <span>Contact: {customer.contact_person}</span>
                    )}
                    {customer.email && (
                      <span>Email: {customer.email}</span>
                    )}
                    {customer.phone && (
                      <span>Phone: {customer.phone}</span>
                    )}
                    {customer.address && (
                      <span>Address: {customer.address}</span>
                    )}
                  </div>
                  
                  {customer.delivery_instructions && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Delivery Instructions: </span>
                      <span className="text-muted-foreground">{customer.delivery_instructions}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{customer.name}"? 
                          This action cannot be undone and may affect existing dispatch records.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(customer.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={editingCustomer || undefined}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
