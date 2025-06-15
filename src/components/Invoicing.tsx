
import { Receipt } from "lucide-react";
import { InvoiceProposal } from "./InvoiceProposal";
import { InvoiceFilters } from "./InvoiceFilters";
import { useState } from "react";
import { format, subWeeks, startOfWeek, endOfWeek } from "date-fns";

interface InvoicingProps {
  currentLocation: "tothai" | "khin";
}

export function Invoicing({ currentLocation }: InvoicingProps) {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "current" | "custom" | "2weeks" | "1month">("2weeks");
  const [productTypeFilter, setProductTypeFilter] = useState<"self-produced" | "external" | "both">("self-produced");
  const [showProposal, setShowProposal] = useState(false);
  
  // Initialize with previous 2 weeks
  const today = new Date();
  const twoWeeksAgo = subWeeks(today, 2);
  const defaultStartDate = startOfWeek(twoWeeksAgo, { weekStartsOn: 1 });
  const defaultEndDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  
  const [customStartDate, setCustomStartDate] = useState<string>(format(defaultStartDate, "yyyy-MM-dd"));
  const [customEndDate, setCustomEndDate] = useState<string>(format(defaultEndDate, "yyyy-MM-dd"));

  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  const handleGenerateProposal = () => {
    setShowProposal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Factuurvoorstel</h1>
          <p className="text-muted-foreground">
            Genereer factuurvoorstellen op basis van geleverde producten voor {getLocationName(currentLocation)}
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
        onGenerateProposal={handleGenerateProposal}
        productTypeFilter={productTypeFilter}
        onProductTypeFilterChange={setProductTypeFilter}
      />

      {showProposal && customStartDate && customEndDate && (
        <InvoiceProposal
          currentLocation={currentLocation}
          startDate={customStartDate}
          endDate={customEndDate}
          productTypeFilter={productTypeFilter}
        />
      )}
    </div>
  );
}
