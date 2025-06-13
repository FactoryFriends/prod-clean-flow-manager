
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus } from "lucide-react";

interface InvoiceFiltersProps {
  filterPeriod: "all" | "current" | "custom";
  onFilterPeriodChange: (period: "all" | "current" | "custom") => void;
  customStartDate: string;
  onCustomStartDateChange: (date: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (date: string) => void;
  currentLocation: "tothai" | "khin";
}

export function InvoiceFilters({
  filterPeriod,
  onFilterPeriodChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  currentLocation
}: InvoiceFiltersProps) {
  const handleGenerateInvoice = () => {
    // TODO: Implement automatic invoice generation for current 2-week period
    console.log("Generating invoice for current period...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Factuur Filters & Acties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="period-select">Periode</Label>
            <Select value={filterPeriod} onValueChange={onFilterPeriodChange}>
              <SelectTrigger id="period-select">
                <SelectValue placeholder="Selecteer periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Huidige tweewekelijkse periode</SelectItem>
                <SelectItem value="all">Alle facturen</SelectItem>
                <SelectItem value="custom">Aangepaste periode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterPeriod === "custom" && (
            <>
              <div className="flex-1">
                <Label htmlFor="start-date">Van datum</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date">Tot datum</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange(e.target.value)}
                />
              </div>
            </>
          )}

          <Button onClick={handleGenerateInvoice} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Genereer Factuur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
