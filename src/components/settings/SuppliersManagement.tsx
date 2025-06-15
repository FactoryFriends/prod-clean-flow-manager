
import React, { useState } from "react";
import { useAllSuppliers, useCreateSupplier, useUpdateSupplier, useDeactivateSupplier, Supplier } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SuppliersManagement() {
  const { data: suppliers, isLoading, isError, error } = useAllSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deactivateSupplier = useDeactivateSupplier();

  const [editing, setEditing] = useState<null | Supplier>(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  function handleEditClick(supplier: Supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact_person: supplier.contact_person ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
    });
  }

  function handleCancel() {
    setEditing(null);
    setForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      updateSupplier.mutate(
        { id: editing.id, ...form },
        { onSuccess: handleCancel }
      );
    } else {
      createSupplier.mutate(form, { onSuccess: handleCancel });
    }
  }

  return (
    <div className="space-y-6">
      <form className="bg-muted p-4 rounded-xl space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Supplier name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            placeholder="Contact (optional)"
            value={form.contact_person}
            onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
          />
          <Input
            placeholder="E-mail (optional)"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Button type="submit" className="shrink-0 min-w-max">
            {editing ? "Save" : "Add"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
      <div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading suppliers...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-600">
            Failed to load suppliers. {error?.message || "Unknown error."}
          </div>
        ) : suppliers?.length === 0 ? (
          <div className="text-muted-foreground">No suppliers found.</div>
        ) : (
          <div className="space-y-2">
            {suppliers?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white p-3 rounded border gap-3"
              >
                <div>
                  <span className="font-medium">{s.name}</span>
                  {s.contact_person && <span className="ml-2 text-xs text-muted-foreground">({s.contact_person})</span>}
                  {s.email && <span className="ml-3 text-xs">{s.email}</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(s)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deactivateSupplier.mutate(s.id)}>
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
