import { useMemo } from "react";
import { format, eachDayOfInterval, startOfDay } from "date-fns";
import { nl } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemperatureEquipment, useTemperatureLogs } from "@/hooks/useTemperatureLogs";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { cn } from "@/lib/utils";

interface TemperatureLogsTableProps {
  location: "tothai" | "khin";
  startDate: Date;
  endDate: Date;
}

export function TemperatureLogsTable({
  location,
  startDate,
  endDate,
}: TemperatureLogsTableProps) {
  const { data: equipment, isLoading: equipmentLoading } = useTemperatureEquipment(location);
  const { data: logs, isLoading: logsLoading } = useTemperatureLogs(location, startDate, endDate);
  const { data: staffCodes } = useStaffCodes();

  // Helper to get staff name from code
  const getStaffName = (code: string | null) => {
    if (!code) return "-";
    const staff = staffCodes?.find(s => s.code === code);
    return staff?.name || code;
  };

  // Generate all dates in range
  const dates = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate }).reverse();
  }, [startDate, endDate]);

  // Group logs by date and equipment
  const logsByDateAndEquipment = useMemo(() => {
    const map: Record<string, Record<string, { temperature: number; is_within_range: boolean; recorded_by: string | null }>> = {};
    
    logs?.forEach((log) => {
      if (!map[log.log_date]) {
        map[log.log_date] = {};
      }
      map[log.log_date][log.equipment_id] = {
        temperature: log.temperature,
        is_within_range: log.is_within_range,
        recorded_by: log.recorded_by,
      };
    });
    
    return map;
  }, [logs]);

  const freezers = equipment?.filter((eq) => eq.equipment_type === "freezer") || [];
  const fridges = equipment?.filter((eq) => eq.equipment_type === "fridge") || [];

  if (equipmentLoading || logsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Geen apparatuur geconfigureerd voor deze locatie.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Datum</TableHead>
            {freezers.map((eq) => (
              <TableHead key={eq.id} className="text-center min-w-[60px]">
                {eq.code}
              </TableHead>
            ))}
            {fridges.map((eq) => (
              <TableHead key={eq.id} className="text-center min-w-[60px]">
                {eq.code}
              </TableHead>
            ))}
            <TableHead className="min-w-[60px]">Door</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dates.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayLogs = logsByDateAndEquipment[dateStr];
            const hasData = dayLogs && Object.keys(dayLogs).length > 0;
            const recordedBy = hasData ? Object.values(dayLogs)[0]?.recorded_by : null;
            const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;

            return (
              <TableRow 
                key={dateStr}
                className={cn(
                  !hasData && "bg-muted/30",
                  isToday && "bg-primary/5"
                )}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {format(date, "EEE d MMM", { locale: nl })}
                  {isToday && <span className="ml-1 text-xs text-primary">(vandaag)</span>}
                </TableCell>
                {freezers.map((eq) => {
                  const log = dayLogs?.[eq.id];
                  return (
                    <TableCell 
                      key={eq.id} 
                      className={cn(
                        "text-center font-mono",
                        log && !log.is_within_range && "text-red-600 font-bold bg-red-50 dark:bg-red-950"
                      )}
                    >
                      {log ? log.temperature.toFixed(1) : "-"}
                    </TableCell>
                  );
                })}
                {fridges.map((eq) => {
                  const log = dayLogs?.[eq.id];
                  return (
                    <TableCell 
                      key={eq.id} 
                      className={cn(
                        "text-center font-mono",
                        log && !log.is_within_range && "text-red-600 font-bold bg-red-50 dark:bg-red-950"
                      )}
                    >
                      {log ? (log.temperature > 0 ? `+${log.temperature.toFixed(1)}` : log.temperature.toFixed(1)) : "-"}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {getStaffName(recordedBy)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
