
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DrinkList } from "../../drinks/DrinkList";

interface DrinksTabProps {
  drinkFilter: string;
  setDrinkFilter: (filter: string) => void;
  onAddNewDrink: () => void;
  onEditProduct: (product: any) => void;
}

export function DrinksTab({ 
  drinkFilter, 
  setDrinkFilter, 
  onAddNewDrink, 
  onEditProduct 
}: DrinksTabProps) {
  return (
    <TabsContent value="drinks" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Drink Management</CardTitle>
              <CardDescription>Manage drinks that are bought and sold directly</CardDescription>
            </div>
            <Button onClick={onAddNewDrink} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Drink
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter drinks..."
              value={drinkFilter}
              onChange={(e) => setDrinkFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <DrinkList onEditProduct={onEditProduct} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
