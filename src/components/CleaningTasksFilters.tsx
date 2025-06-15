
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
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 w-full">
      {/* Today Button on the left */}
      <div className="flex flex-row sm:flex-col w-full sm:w-auto sm:min-w-[80px]">
        <Button
          className="w-full sm:w-auto mb-0 sm:mb-2 font-semibold"
          variant="default"
          onClick={onToday}
        >
          Today
        </Button>
      </div>
      {/* Start Date */}
      <div className="flex flex-col w-full min-w-[180px] max-w-[220px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1 whitespace-nowrap">
          Start date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full min-w-[160px] max-w-[220px] justify-start text-left font-normal truncate",
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
      {/* End Date */}
      <div className="flex flex-col w-full min-w-[180px] max-w-[220px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1 whitespace-nowrap">
          End date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full min-w-[160px] max-w-[220px] justify-start text-left font-normal truncate",
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
