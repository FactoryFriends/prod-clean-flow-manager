
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateStaffCode, useUpdateStaffCode } from "@/hooks/useStaffCodeMutations";

interface StaffCode {
  code: string;
  name: string;
  role?: string;
  location?: "tothai" | "khin" | "both";
  active?: boolean;
  department?: string;
  permission_level?: "basic" | "supervisor" | "manager";
}

interface StaffCodeFormProps {
  editingStaffCode?: StaffCode | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StaffCodeForm({ editingStaffCode, onSuccess, onCancel }: StaffCodeFormProps) {
  const [formData, setFormData] = useState({
    code: editingStaffCode?.code || "",
    name: editingStaffCode?.name || "",
    role: editingStaffCode?.role || "",
    location: editingStaffCode?.location || "both" as const,
    active: editingStaffCode?.active ?? true,
    department: editingStaffCode?.department || "",
    permission_level: editingStaffCode?.permission_level || "basic" as const,
  });

  const createStaffCode = useCreateStaffCode();
  const updateStaffCode = useUpdateStaffCode();

  const isEditing = !!editingStaffCode;
  const isLoading = createStaffCode.isPending || updateStaffCode.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      return;
    }

    const mutation = isEditing ? updateStaffCode : createStaffCode;
    mutation.mutate(formData, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Staff Code *</Label>
          <Input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Enter 4-digit staff code"
            maxLength={4}
            disabled={isEditing || isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Staff Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter staff member name"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Enter role (optional)"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Enter department (optional)"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select 
            value={formData.location} 
            onValueChange={(value: "tothai" | "khin" | "both") => 
              setFormData({ ...formData, location: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tothai">ToThai Production Facility</SelectItem>
              <SelectItem value="khin">KHIN Restaurant</SelectItem>
              <SelectItem value="both">Both Locations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="permission_level">Permission Level</Label>
          <Select 
            value={formData.permission_level} 
            onValueChange={(value: "basic" | "supervisor" | "manager") => 
              setFormData({ ...formData, permission_level: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select permission level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Staff Code" : "Create Staff Code"}
        </Button>
      </div>
    </form>
  );
}
