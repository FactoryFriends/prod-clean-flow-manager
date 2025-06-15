
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
  onToday
}: CleaningTasksFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Start date:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              {startDate ? format(startDate, "PPP") : <span>Select</span>}
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
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">End date:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              {endDate ? format(endDate, "PPP") : <span>Select</span>}
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
      <div className="flex-1 flex items-end">
        <Button
          className="ml-0 sm:ml-4"
          variant="link"
          onClick={onToday}
        >
          Today
        </Button>
      </div>
    </div>
  );
}
