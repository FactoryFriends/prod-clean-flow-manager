
import { Search, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface CleaningTaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  showOnlyFAVV: boolean;
  setShowOnlyFAVV: (show: boolean) => void;
}

export function CleaningTaskFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  showOnlyFAVV,
  setShowOnlyFAVV
}: CleaningTaskFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search cleaning tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        
        <Button
          variant={showOnlyFAVV ? "default" : "outline"}
          onClick={() => setShowOnlyFAVV(!showOnlyFAVV)}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          FAVV Only
        </Button>
      </div>
    </div>
  );
}
