import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateChef, useUpdateChef } from "@/hooks/useChefMutations";

interface ChefFormProps {
  chef?: any;
  onSuccess: () => void;
}

export function ChefForm({ chef, onSuccess }: ChefFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "tothai" as "tothai" | "khin",
    active: true,
  });

  const createChefMutation = useCreateChef();
  const updateChefMutation = useUpdateChef();

  useEffect(() => {
    if (chef) {
      setFormData({
        name: chef.name || "",
        location: chef.location || "tothai",
        active: chef.active ?? true,
      });
    } else {
      setFormData({
        name: "",
        location: "tothai",
        active: true,
      });
    }
  }, [chef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (chef) {
        await updateChefMutation.mutateAsync({
          id: chef.id,
          ...formData,
        });
      } else {
        await createChefMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving chef:", error);
    }
  };

  const isLoading = createChefMutation.isPending || updateChefMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{chef ? "Edit Chef" : "Add New Chef"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Select
            value={formData.location}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, location: value as "tothai" | "khin" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tothai">To Thai</SelectItem>
              <SelectItem value="khin">Khin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, active: checked }))
            }
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : chef ? "Update Chef" : "Create Chef"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}