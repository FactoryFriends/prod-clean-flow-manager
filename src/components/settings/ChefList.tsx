import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useChefs } from "@/hooks/useProductionData";
import { useDeleteChef } from "@/hooks/useChefMutations";
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

interface ChefListProps {
  filter: string;
  onEditChef: (chef: any) => void;
}

export function ChefList({ filter, onEditChef }: ChefListProps) {
  const { data: chefs = [] } = useChefs();
  const deleteChefMutation = useDeleteChef();

  const filteredChefs = chefs.filter((chef) =>
    chef.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteChefMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting chef:", error);
    }
  };

  return (
    <div className="space-y-4">
      {filteredChefs.map((chef) => (
        <Card key={chef.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{chef.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={chef.active ? "default" : "secondary"}>
                  {chef.active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {chef.location === "tothai" ? "To Thai" : "Khin"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Created: {new Date(chef.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditChef(chef)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!chef.active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate Chef</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate "{chef.name}"? This action can be undone by editing the chef.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(chef.id)}
                        disabled={deleteChefMutation.isPending}
                      >
                        {deleteChefMutation.isPending ? "Deactivating..." : "Deactivate"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredChefs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No chefs found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}