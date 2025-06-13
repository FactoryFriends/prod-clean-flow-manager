
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
