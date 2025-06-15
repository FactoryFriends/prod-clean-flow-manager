import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "./ui/DateRangePicker";

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
    <div className="flex flex-col w-full gap-3">
      <DateRangePicker
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <Button
        variant="default"
        className="w-full h-12 bg-[#11182a] hover:bg-[#0d1422] text-white font-bold rounded-lg text-base shadow-none"
        onClick={onToday}
        tabIndex={0}
      >
        Today
      </Button>
    </div>
  );
}
