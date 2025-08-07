import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ChefList } from "@/components/settings/ChefList";

interface ChefsTabProps {
  chefFilter: string;
  setChefFilter: (filter: string) => void;
  onAddNewChef: () => void;
  onEditChef: (chef: any) => void;
}

export function ChefsTab({
  chefFilter,
  setChefFilter,
  onAddNewChef,
  onEditChef,
}: ChefsTabProps) {
  return (
    <TabsContent value="chefs" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Chefs Management</h3>
        <Button onClick={onAddNewChef}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chef
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search chefs..."
          value={chefFilter}
          onChange={(e) => setChefFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      <ChefList filter={chefFilter} onEditChef={onEditChef} />
    </TabsContent>
  );
}