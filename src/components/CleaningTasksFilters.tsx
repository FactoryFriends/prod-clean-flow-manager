
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-2 w-full">
      {/* Today Button at far left, large and rounded, dark */}
      <Button
        variant="default"
        className={cn(
          "bg-[#11182a] hover:bg-[#0d1422] text-white font-bold rounded-xl h-14 w-[150px] sm:w-[150px] text-lg shadow-none flex-shrink-0"
        )}
        onClick={onToday}
        tabIndex={0}
      >
        Today
      </Button>
      {/* Start Date Picker */}
      <div className="flex flex-col w-full max-w-[260px]">
        <label className="block text-xs font-semibold text-muted-foreground mb-1 ml-2 whitespace-nowrap">
          Start date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 border border-[#d6deea] bg-white px-5 justify-start text-left font-medium rounded-xl text-lg shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-6 w-6 text-[#11182a]" />
              <span className="truncate">
                {startDate ? format(startDate, "PPPP") : <span>Select</span>}
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
      {/* End Date Picker */}
      <div className="flex flex-col w-full max-w-[260px]">
        <label className="block text-xs font-semibold text-muted-foreground mb-1 ml-2 whitespace-nowrap">
          End date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 border border-[#d6deea] bg-white px-5 justify-start text-left font-medium rounded-xl text-lg shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-6 w-6 text-[#11182a]" />
              <span className="truncate">
                {endDate ? format(endDate, "PPPP") : <span>Select</span>}
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

