
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, FileText } from "lucide-react";
import { format, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface InvoiceFiltersProps {
  filterPeriod: "all" | "current" | "custom" | "2weeks" | "1month";
  onFilterPeriodChange: (period: "all" | "current" | "custom" | "2weeks" | "1month") => void;
  customStartDate: string;
  onCustomStartDateChange: (date: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (date: string) => void;
  currentLocation: "tothai" | "khin";
  onGenerateProposal: () => void;
  productTypeFilter: "self-produced" | "external" | "both";
  onProductTypeFilterChange: (type: "self-produced" | "external" | "both") => void;
}

export function InvoiceFilters({
  filterPeriod,
  onFilterPeriodChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  currentLocation,
  onGenerateProposal,
  productTypeFilter,
  onProductTypeFilterChange
}: InvoiceFiltersProps) {

  const handlePeriodChange = (period: "all" | "current" | "custom" | "2weeks" | "1month") => {
    onFilterPeriodChange(period);
    
    // Auto-set dates for predefined periods
    const today = new Date();
    
    if (period === "2weeks") {
      // Previous 2 weeks
      const twoWeeksAgo = subWeeks(today, 2);
      const startDate = startOfWeek(twoWeeksAgo, { weekStartsOn: 1 }); // Monday
      const endDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }); // Sunday
      
      onCustomStartDateChange(format(startDate, "yyyy-MM-dd"));
      onCustomEndDateChange(format(endDate, "yyyy-MM-dd"));
    } else if (period === "1month") {
      // Previous month
      const lastMonth = subMonths(today, 1);
      const startDate = startOfMonth(lastMonth);
      const endDate = endOfMonth(lastMonth);
      
      onCustomStartDateChange(format(startDate, "yyyy-MM-dd"));
      onCustomEndDateChange(format(endDate, "yyyy-MM-dd"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Factuurvoorstel Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="period-select">Periode</Label>
            <Select value={filterPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger id="period-select">
                <SelectValue placeholder="Selecteer periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2weeks">Vorige 2 weken</SelectItem>
                <SelectItem value="1month">Vorige maand</SelectItem>
                <SelectItem value="custom">Aangepaste periode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label htmlFor="product-type-select">Product Type</Label>
            <Select value={productTypeFilter} onValueChange={onProductTypeFilterChange}>
              <SelectTrigger id="product-type-select">
                <SelectValue placeholder="Selecteer product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self-produced">Alleen zelf geproduceerd</SelectItem>
                <SelectItem value="external">Alleen externe producten</SelectItem>
                <SelectItem value="both">Beide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filterPeriod === "custom" || filterPeriod === "2weeks" || filterPeriod === "1month") && (
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

          <Button 
            onClick={onGenerateProposal} 
            className="flex items-center gap-2"
            disabled={!customStartDate || !customEndDate}
          >
            <FileText className="w-4 h-4" />
            Genereer Voorstel
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>• Producten worden gefilterd op basis van geselecteerd type</p>
          <p>• Gebaseerd op packing slip datums en geleverde hoeveelheden</p>
          <p>• {productTypeFilter === "self-produced" && "Alleen zelf geproduceerde producten worden meegenomen"}</p>
          <p>• {productTypeFilter === "external" && "Alleen externe producten worden meegenomen"}</p>
          <p>• {productTypeFilter === "both" && "Zowel zelf geproduceerde als externe producten worden meegenomen"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
