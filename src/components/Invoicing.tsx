
import { Receipt } from "lucide-react";
import { InvoiceList } from "./InvoiceList";
import { InvoiceFilters } from "./InvoiceFilters";
import { useState } from "react";

interface InvoicingProps {
  currentLocation: "tothai" | "khin";
}

export function Invoicing({ currentLocation }: InvoicingProps) {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "current" | "custom">("current");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoicing</h1>
          <p className="text-muted-foreground">
            Manage invoices and bi-weekly reports for {getLocationName(currentLocation)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Actieve locatie: {getLocationName(currentLocation)}
          </span>
        </div>
      </div>

      <InvoiceFilters
        filterPeriod={filterPeriod}
        onFilterPeriodChange={setFilterPeriod}
        customStartDate={customStartDate}
        onCustomStartDateChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndDateChange={setCustomEndDate}
        currentLocation={currentLocation}
      />

      <InvoiceList
        currentLocation={currentLocation}
        filterPeriod={filterPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />
    </div>
  );
}
