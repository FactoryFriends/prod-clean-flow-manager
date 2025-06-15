import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";
import { OperationsFilters } from "./favv/OperationsFilters";
import { CleaningTasksFilters } from "./favv/CleaningTasksFilters";
import { PackingSlipsTable } from "./favv/PackingSlipsTable";
import { StockTakesTable } from "./favv/StockTakesTable";
import { CompletedTasksTable } from "./favv/CompletedTasksTable";
import { exportPackingSlipsCSV, exportStockTakesCSV, exportCompletedTasksCSV } from "./favv/csvExportUtils";
import { useFAVVPackingSlips } from "../hooks/useFAVVPackingSlips";
import { useFAVVStockTakes } from "../hooks/useFAVVStockTakes";
import { useFAVVCompletedTasks } from "../hooks/useFAVVCompletedTasks";
import { Package, FileText, Brush } from "lucide-react";

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

  // Use the extracted hooks
  const { data: packingSlips = [], isLoading: isLoadingPackingSlips } = useFAVVPackingSlips({
    locationFilter,
    startDate,
    endDate
  });

  const { data: stockTakes = [], isLoading: isLoadingStockTakes } = useFAVVStockTakes({
    startDate,
    endDate,
    enabled: locationFilter === "tothai"
  });

  const { data: completedTasks = [], isLoading: isLoadingTasks } = useFAVVCompletedTasks({
    locationFilter,
    startDate,
    endDate,
    taskNameFilter
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">FAVV Compliance Reports</CardTitle>
          <CardDescription>
            Complete overview of production, distribution, and cleaning compliance for FAVV inspections
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="produced" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produced" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Produced Batches
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Packing Lists
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            <Brush className="w-4 h-4" />
            Cleaning Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produced" className="space-y-6">
          <OperationsFilters
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={() => exportStockTakesCSV(stockTakes)}
            exportDisabled={!stockTakes.length}
            title="Production Overview"
            description="Filter and view all produced batches"
          />

          <StockTakesTable stockTakes={stockTakes} isLoading={isLoadingStockTakes} />
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-6">
          <OperationsFilters
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={() => exportPackingSlipsCSV(packingSlips)}
            exportDisabled={!packingSlips.length}
            title="Dispatch Overview"
            description="Filter and view all packing slips and dispatches"
          />

          <PackingSlipsTable packingSlips={packingSlips} isLoading={isLoadingPackingSlips} />
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
