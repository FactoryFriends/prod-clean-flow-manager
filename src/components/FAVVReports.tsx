

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Download, FileText, Filter, Package, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface FAVVReportsProps {
  currentLocation: "tothai" | "khin";
}

export function FAVVReports({ currentLocation }: FAVVReportsProps) {
  const [locationFilter, setLocationFilter] = useState<"all" | "tothai" | "khin">(currentLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [taskNameFilter, setTaskNameFilter] = useState<string>("");

  // Fetch packing slips with filters (for non-ToThai locations)
  const { data: packingSlips = [], isLoading: isLoadingPackingSlips } = useQuery({
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
    enabled: locationFilter !== "tothai",
  });

  // Fetch stock takes for ToThai location
  const { data: stockTakes = [], isLoading: isLoadingStockTakes } = useQuery({
    queryKey: ["favv-stock-takes", startDate, endDate],
    queryFn: async () => {
      // For now, we'll use production_batches as a proxy for stock takes
      // This could be replaced with a dedicated stock_takes table in the future
      let query = supabase
        .from("production_batches")
        .select(`
          *,
          products (name, unit_type),
          chefs (name)
        `)
        .eq("location", "tothai")
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
      return data;
    },
    enabled: locationFilter === "tothai",
  });

  // Fetch completed cleaning tasks with staff initials
  const { data: completedTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["favv-completed-tasks", locationFilter, startDate, endDate, taskNameFilter],
    queryFn: async () => {
      let query = supabase
        .from("cleaning_tasks")
        .select(`
          *,
          staff_codes!cleaning_tasks_completed_by_fkey (
            initials
          )
        `)
        .eq("status", "closed")
        .order("completed_at", { ascending: false });

      if (locationFilter && locationFilter !== "all") {
        query = query.eq("location", locationFilter);
      }

      if (startDate) {
        query = query.gte("completed_at", startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("completed_at", endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by task name on client side
      return data.filter(task => 
        !taskNameFilter || task.title.toLowerCase().includes(taskNameFilter.toLowerCase())
      );
    },
  });

  const exportPackingSlipsCSV = () => {
    if (!packingSlips.length) {
      toast.error("No packing slips to export");
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

    downloadCSV(csvContent, `FAVV_Packing_Slips_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportStockTakesCSV = () => {
    if (!stockTakes.length) {
      toast.error("No stock takes to export");
      return;
    }

    const csvHeaders = [
      "Batch Number",
      "Date Created",
      "Product Name",
      "Production Date",
      "Expiry Date",
      "Packages Produced",
      "Chef Name",
      "Unit Type",
      "Production Notes"
    ];

    const csvData = stockTakes.map(batch => [
      batch.batch_number,
      format(new Date(batch.created_at), "yyyy-MM-dd HH:mm"),
      batch.products?.name || "",
      format(new Date(batch.production_date), "yyyy-MM-dd"),
      format(new Date(batch.expiry_date), "yyyy-MM-dd"),
      batch.packages_produced,
      batch.chefs?.name || "",
      batch.products?.unit_type || "",
      batch.production_notes || ""
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\n");

    downloadCSV(csvContent, `FAVV_Stock_Takes_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportCompletedTasksCSV = () => {
    if (!completedTasks.length) {
      toast.error("No completed tasks to export");
      return;
    }

    const csvHeaders = [
      "Task Title",
      "Description",
      "Location",
      "Scheduled Date",
      "Completed Date",
      "Completed By",
      "Assigned Role",
      "FAVV Compliance",
      "Estimated Duration (min)",
      "Actual Duration (min)",
      "Completion Notes"
    ];

    const csvData = completedTasks.map(task => [
      task.title,
      task.description || "",
      task.location?.toUpperCase() || "",
      format(new Date(task.scheduled_date), "yyyy-MM-dd"),
      task.completed_at ? format(new Date(task.completed_at), "yyyy-MM-dd HH:mm") : "",
      task.staff_codes?.initials || "",
      task.assigned_role || "",
      task.favv_compliance ? "Yes" : "No",
      task.estimated_duration || "",
      task.actual_duration || "",
      task.completion_notes || ""
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\n");

    downloadCSV(csvContent, `FAVV_Completed_Tasks_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file downloaded successfully");
  };

  const isLoading = isLoadingPackingSlips || isLoadingStockTakes || isLoadingTasks;

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

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="operations">Operations Reports</TabsTrigger>
          <TabsTrigger value="cleaning">Cleaning Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {locationFilter === "tothai" ? "Stock Take Filters" : "Packing Slip Filters"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={locationFilter} onValueChange={(value: "all" | "tothai" | "khin") => setLocationFilter(value)}>
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
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a date"}
                        </span>
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
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {endDate ? format(endDate, "MMM dd, yyyy") : "Pick a date"}
                        </span>
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
                    onClick={locationFilter === "tothai" ? exportStockTakesCSV : exportPackingSlipsCSV}
                    className="w-full"
                    disabled={locationFilter === "tothai" ? !stockTakes.length : !packingSlips.length}
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
                {locationFilter === "tothai" ? (
                  <>
                    <Package className="w-5 h-5" />
                    Stock Takes ({stockTakes.length})
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Packing Slips ({packingSlips.length})
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  Loading {locationFilter === "tothai" ? "stock takes" : "packing slips"}...
                </div>
              ) : locationFilter === "tothai" ? (
                !stockTakes.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No stock takes found for the selected criteria
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Production Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Packages</TableHead>
                          <TableHead>Chef</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockTakes.map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell className="font-mono text-sm">
                              {batch.batch_number}
                            </TableCell>
                            <TableCell>
                              {format(new Date(batch.created_at), "MMM dd, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>{batch.products?.name || "N/A"}</TableCell>
                            <TableCell>
                              {format(new Date(batch.production_date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {format(new Date(batch.expiry_date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{batch.packages_produced}</TableCell>
                            <TableCell>{batch.chefs?.name || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : (
                !packingSlips.length ? (
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
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleaning" className="space-y-6">
          {/* Cleaning Tasks Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Completed Cleaning Tasks Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={locationFilter} onValueChange={(value: "all" | "tothai" | "khin") => setLocationFilter(value)}>
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

                {/* Task Name Filter */}
                <div className="space-y-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    placeholder="Filter by task name..."
                    value={taskNameFilter}
                    onChange={(e) => setTaskNameFilter(e.target.value)}
                  />
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
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a date"}
                        </span>
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
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {endDate ? format(endDate, "MMM dd, yyyy") : "Pick a date"}
                        </span>
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
                    onClick={exportCompletedTasksCSV}
                    className="w-full"
                    disabled={!completedTasks.length}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks Results Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Completed Cleaning Tasks ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  Loading completed cleaning tasks...
                </div>
              ) : !completedTasks.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed cleaning tasks found for the selected criteria
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Completed Date</TableHead>
                        <TableHead>Completed By</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>FAVV</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {task.location?.toUpperCase() || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(task.scheduled_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {task.completed_at 
                              ? format(new Date(task.completed_at), "MMM dd, yyyy HH:mm")
                              : "N/A"
                            }
                          </TableCell>
                          <TableCell>{task.staff_codes?.initials || "N/A"}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              task.assigned_role === "chef" && "bg-orange-100 text-orange-800",
                              task.assigned_role === "cleaner" && "bg-green-100 text-green-800",
                              task.assigned_role === "other" && "bg-gray-100 text-gray-800"
                            )}>
                              {task.assigned_role || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {task.favv_compliance ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.actual_duration 
                              ? `${task.actual_duration} min`
                              : task.estimated_duration
                              ? `~${task.estimated_duration} min`
                              : "N/A"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

