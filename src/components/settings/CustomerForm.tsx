
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateCustomer, useUpdateCustomer, Customer } from "@/hooks/useCustomers";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || "");
  const [customerType, setCustomerType] = useState<"restaurant" | "external">(
    customer?.customer_type || "external"
  );
  const [contactPerson, setContactPerson] = useState(customer?.contact_person || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    customer?.delivery_instructions || ""
  );
  const [active, setActive] = useState(customer?.active ?? true);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      customer_type: customerType,
      contact_person: contactPerson || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      delivery_instructions: deliveryInstructions || undefined,
      active,
    };

    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data });
      } else {
        await createCustomer.mutateAsync(data);
      }
      
      // Reset form if creating new customer
      if (!customer) {
        setName("");
        setCustomerType("external");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setAddress("");
        setDeliveryInstructions("");
        setActive(true);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const isLoading = createCustomer.isPending || updateCustomer.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Customer Type *</Label>
          <Select value={customerType} onValueChange={(value: "restaurant" | "external") => setCustomerType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact Person</Label>
          <Input
            id="contact"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery">Delivery Instructions</Label>
        <Textarea
          id="delivery"
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={setActive}
          disabled={isLoading}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
      </Button>
    </form>
  );
}
