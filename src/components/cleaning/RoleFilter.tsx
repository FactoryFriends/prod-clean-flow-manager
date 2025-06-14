
import { ChefHat, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleFilterProps {
  filterRole: "all" | "chef" | "cleaner";
  onRoleChange: (role: "all" | "chef" | "cleaner") => void;
}

export function RoleFilter({ filterRole, onRoleChange }: RoleFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">Filter by Role:</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={filterRole === 'all' ? 'default' : 'outline'}
          onClick={() => onRoleChange('all')}
          className={cn(
            "px-4 py-2",
            filterRole === 'all' 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          All Tasks
        </Button>
        <Button
          variant={filterRole === 'chef' ? 'default' : 'outline'}
          onClick={() => onRoleChange('chef')}
          className={cn(
            "flex items-center gap-2 px-4 py-2",
            filterRole === 'chef' 
              ? "bg-orange-500 hover:bg-orange-600 text-white" 
              : "border-orange-300 text-orange-700 hover:bg-orange-50"
          )}
        >
          <ChefHat className="w-4 h-4" />
          Chef Tasks
        </Button>
        <Button
          variant={filterRole === 'cleaner' ? 'default' : 'outline'}
          onClick={() => onRoleChange('cleaner')}
          className={cn(
            "flex items-center gap-2 px-4 py-2",
            filterRole === 'cleaner' 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "border-green-300 text-green-700 hover:bg-green-50"
          )}
        >
          <Users className="w-4 h-4" />
          Staff Tasks
        </Button>
      </div>
    </div>
  );
}
