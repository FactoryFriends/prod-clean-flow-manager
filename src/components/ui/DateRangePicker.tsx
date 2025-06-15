
import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
}

export function DateRangePicker({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-row gap-3 w-full">
      {/* Start Date Picker */}
      <div className="flex flex-col w-1/2 max-w-[170px]">
        <label className="block text-xs font-semibold text-muted-foreground mb-1 ml-2 whitespace-nowrap">
          Start date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 border border-[#d6deea] bg-white px-2 justify-start text-left font-medium rounded-lg text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-[#11182a]" />
              <span className="truncate">
                {startDate ? format(startDate, "PP") : <span>Select</span>}
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
      <div className="flex flex-col w-1/2 max-w-[170px]">
        <label className="block text-xs font-semibold text-muted-foreground mb-1 ml-2 whitespace-nowrap">
          End date:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 border border-[#d6deea] bg-white px-2 justify-start text-left font-medium rounded-lg text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-[#11182a]" />
              <span className="truncate">
                {endDate ? format(endDate, "PP") : <span>Select</span>}
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
