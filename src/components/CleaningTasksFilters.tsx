
import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CleaningTasksFiltersProps {
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  onToday: () => void;
}

export function CleaningTasksFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onToday,
}: CleaningTasksFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 w-full">
      {/* Today Button inline left */}
      <Button
        variant="default"
        className="font-semibold whitespace-nowrap h-10 px-5"
        onClick={onToday}
      >
        Today
      </Button>
      {/* Start Date Filter */}
      <div className="flex flex-col w-full min-w-[140px] max-w-[220px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1 whitespace-nowrap">
          Start date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full min-w-[120px] max-w-[220px] justify-start text-left font-normal truncate",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {startDate ? format(startDate, "PPP") : <span>Select</span>}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={startDate ?? undefined}
              onSelect={date => setStartDate(date ?? null)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* End Date Filter */}
      <div className="flex flex-col w-full min-w-[140px] max-w-[220px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1 whitespace-nowrap">
          End date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full min-w-[120px] max-w-[220px] justify-start text-left font-normal truncate",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {endDate ? format(endDate, "PPP") : <span>Select</span>}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={endDate ?? undefined}
              onSelect={date => setEndDate(date ?? null)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
