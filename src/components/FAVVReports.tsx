import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";
import { OperationsFilters } from "./favv/OperationsFilters";
import { CleaningTasksFilters } from "./favv/CleaningTasksFilters";
import { PackingSlipsTable } from "./favv/PackingSlipsTable";
import { StockTakesTable } from "./favv/StockTakesTable";
import { CompletedTasksTable } from "./favv/CompletedTasksTable";
import { exportPackingSlipsCSV, exportStockTakesCSV, exportCompletedTasksCSV } from "./favv/csvExportUtils";

interface FAVVReportsProps {
  currentLocation: "tothai" | "khin";
}

export function FAVVReports({ currentLocation }: FAVVReportsProps) {
  const [locationFilter, setLocationFilter] = useState<"all" | "tothai" | "khin">(currentLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [taskNameFilter, setTaskNameFilter] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Fetch packing slips with filters (for non-ToThai locations) - only show shipped packing slips
  const { data: packingSlips = [], isLoading: isLoadingPackingSlips } = useQuery({
    queryKey: ["favv-packing-slips", locationFilter, startDate, endDate],
    queryFn: async () => {
      console.log("Fetching packing slips with filters:", { locationFilter, startDate, endDate });
      
      const { data, error } = await supabase
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
        .eq("status", "shipped")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching packing slips:", error);
        throw error;
      }

      console.log("Raw packing slips data:", data);

      let filteredData = data || [];

      // Apply date filters
      if (startDate) {
        const beforeDateFilter = filteredData.length;
        filteredData = filteredData.filter(slip => 
          new Date(slip.created_at) >= startDate
        );
        console.log(`Date filter (start): ${beforeDateFilter} -> ${filteredData.length}`);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        const beforeDateFilter = filteredData.length;
        filteredData = filteredData.filter(slip => 
          new Date(slip.created_at) <= endOfDay
        );
        console.log(`Date filter (end): ${beforeDateFilter} -> ${filteredData.length}`);
      }

      // Filter by location - if there's no dispatch_records, we'll use a default location based on current location
      const beforeLocationFilter = filteredData.length;
      const locationFilteredData = filteredData.filter(slip => {
        if (!locationFilter || locationFilter === "all") return true;
        
        // If slip has dispatch_records, use its location
        if (slip.dispatch_records?.location) {
          return slip.dispatch_records.location === locationFilter;
        }
        
        // If no dispatch_records, assume it's from currentLocation
        return locationFilter === currentLocation;
      });
      
      console.log(`Location filter: ${beforeLocationFilter} -> ${locationFilteredData.length}`);
      console.log("Final filtered data:", locationFilteredData);

      return locationFilteredData;
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

  // Fetch completed cleaning tasks with proper staff codes handling
  const { data: completedTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["favv-completed-tasks", locationFilter, startDate, endDate, taskNameFilter],
    queryFn: async () => {
      let query = supabase
        .from("cleaning_tasks")
        .select("*")
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
      const filteredTasks = data.filter(task => 
        !taskNameFilter || task.title.toLowerCase().includes(taskNameFilter.toLowerCase())
      );

      // Fetch staff codes separately and map them to tasks
      const uniqueStaffCodes = [...new Set(filteredTasks.map(task => task.completed_by).filter(Boolean))];
      
      if (uniqueStaffCodes.length > 0) {
        const { data: staffCodes, error: staffError } = await supabase
          .from("staff_codes")
          .select("code, initials")
          .in("code", uniqueStaffCodes);

        if (!staffError && staffCodes) {
          const staffCodeMap = new Map(staffCodes.map(sc => [sc.code, sc.initials]) || []);

          return filteredTasks.map(task => ({
            ...task,
            staff_codes: task.completed_by ? { initials: staffCodeMap.get(task.completed_by) || task.completed_by } : null
          }));
        }
      }

      return filteredTasks.map(task => ({
        ...task,
        staff_codes: null
      }));
    },
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
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
          <OperationsFilters
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={locationFilter === "tothai" ? () => exportStockTakesCSV(stockTakes) : () => exportPackingSlipsCSV(packingSlips)}
            exportDisabled={locationFilter === "tothai" ? !stockTakes.length : !packingSlips.length}
          />

          {locationFilter === "tothai" ? (
            <StockTakesTable stockTakes={stockTakes} isLoading={isLoadingStockTakes} />
          ) : (
            <PackingSlipsTable packingSlips={packingSlips} isLoading={isLoadingPackingSlips} />
          )}
        </TabsContent>

        <TabsContent value="cleaning" className="space-y-6">
          <CleaningTasksFilters
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            taskNameFilter={taskNameFilter}
            setTaskNameFilter={setTaskNameFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={() => exportCompletedTasksCSV(completedTasks)}
            exportDisabled={!completedTasks.length}
          />

          <CompletedTasksTable
            completedTasks={completedTasks}
            isLoading={isLoadingTasks}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>
      </Tabs>

      <CleaningTaskDetailsModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
