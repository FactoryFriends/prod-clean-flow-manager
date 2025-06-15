
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { CalendarDays, Download, Filter } from "lucide-react";
import { DatePicker } from "../ui/date-picker";

interface OperationsFiltersProps {
  locationFilter: "all" | "tothai" | "khin";
  setLocationFilter: (location: "all" | "tothai" | "khin") => void;
  startDate?: Date;
  setStartDate: (date: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (date: Date | undefined) => void;
  onExport: () => void;
  exportDisabled: boolean;
  title?: string;
  description?: string;
}

export function OperationsFilters({
  locationFilter,
  setLocationFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
  exportDisabled,
  title = "Operations Filters",
  description = "Filter operations data by location and date range"
}: OperationsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="location-filter">Location</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="tothai">To Thai</SelectItem>
                <SelectItem value="khin">KHIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Select start date"
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="Select end date"
            />
          </div>

          <Button 
            onClick={onExport} 
            disabled={exportDisabled}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
