import React, { useState } from "react";
import { useAllSuppliers, useCreateSupplier, useUpdateSupplier, useDeactivateSupplier, Supplier } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
          <Button type="submit" className="shrink-0 min-w-max flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editing ? "Save" : "Add"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading suppliers...
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-600">
          Failed to load suppliers. {error?.message || "Unknown error."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {(!suppliers || suppliers.length === 0)
                ? "No suppliers found."
                : `${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"}.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers && suppliers.length > 0 ? (
                suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contact_person || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{s.email || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{s.phone || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{s.address || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {s.active ? (
                        <span className="text-green-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(s)}
                              aria-label="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deactivateSupplier.mutate(s.id)}
                              disabled={!s.active}
                              aria-label="Deactivate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Deactivate</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
