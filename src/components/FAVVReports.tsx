
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Download, FileText, Filter } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";

interface FAVVReportsProps {
  currentLocation: "tothai" | "khin";
}

export function FAVVReports({ currentLocation }: FAVVReportsProps) {
  const [locationFilter, setLocationFilter] = useState<string>(currentLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Fetch packing slips with filters
  const { data: packingSlips = [], isLoading } = useQuery({
    queryKey: ["favv-packing-slips", locationFilter, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("packing_slips")
        .select(`
          *,
          dispatch_records (
            location,
            dispatch_type,
            customer,
            picker_name,
            dispatch_notes
          )
        `)
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by location on the client side since dispatch_records.location is in a joined table
      return data.filter(slip => 
        !locationFilter || locationFilter === "all" || 
        slip.dispatch_records?.location === locationFilter
      );
    },
  });

  const exportToCSV = () => {
    if (!packingSlips.length) {
      toast.error("No data to export");
      return;
    }

    const csvHeaders = [
      "Packing Slip Number",
      "Date Created",
      "Location",
      "Destination",
      "Dispatch Type", 
      "Customer",
      "Picker Name",
      "Prepared By",
      "Picked Up By",
      "Total Items",
      "Total Packages",
      "Pickup Date",
      "Notes"
    ];

    const csvData = packingSlips.map(slip => [
      slip.slip_number,
      format(new Date(slip.created_at), "yyyy-MM-dd HH:mm"),
      slip.dispatch_records?.location || "",
      slip.destination,
      slip.dispatch_records?.dispatch_type || "",
      slip.dispatch_records?.customer || "",
      slip.dispatch_records?.picker_name || "",
      slip.prepared_by || "",
      slip.picked_up_by || "",
      slip.total_items,
      slip.total_packages,
      slip.pickup_date ? format(new Date(slip.pickup_date), "yyyy-MM-dd") : "",
      slip.dispatch_records?.dispatch_notes || ""
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FAVV_Packing_Slips_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAVV Reports</h1>
          <p className="text-muted-foreground">
            Compliance reports and documentation for FAVV inspections
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Packing Slip Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="tothai">ToThai</SelectItem>
                  <SelectItem value="khin">KHIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={exportToCSV}
                className="w-full"
                disabled={!packingSlips.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Packing Slips ({packingSlips.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading packing slips...</div>
          ) : packingSlips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No packing slips found for the selected criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slip Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Packages</TableHead>
                    <TableHead>Picker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packingSlips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell className="font-mono text-sm">
                        {slip.slip_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(slip.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {slip.dispatch_records?.location?.toUpperCase() || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>{slip.destination}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          slip.dispatch_records?.dispatch_type === "external" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        )}>
                          {slip.dispatch_records?.dispatch_type || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>{slip.total_items}</TableCell>
                      <TableCell>{slip.total_packages}</TableCell>
                      <TableCell>{slip.dispatch_records?.picker_name || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
