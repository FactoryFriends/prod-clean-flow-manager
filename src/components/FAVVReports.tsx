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
import { BatchesInStockTable } from "./favv/BatchesInStockTable";
import { BatchMovementsTable } from "./favv/BatchMovementsTable";
import { useBatchStock } from "@/hooks/useBatchStock";

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

  // New tabs: "in-stock", "movements", "clear"
  const [batchTab, setBatchTab] = useState<"in-stock" | "movements" | "clear">("in-stock");
  const [batchSearch, setBatchSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<any>(null); // For movement dialog

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

  // Stock query
  const { data: batchesInStock = [], isLoading: isLoadingStock } = useBatchStock({
    location: currentLocation,
    search: batchSearch,
    inStockOnly: batchTab === "in-stock",
  });
  // All batches for clear tab (show all, filter on batchSearch)
  const { data: allBatches = [], isLoading: isLoadingAll } = useBatchStock({
    location: currentLocation,
    search: batchSearch,
    inStockOnly: false,
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Tab UI
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
          {/* Only show search and batch filters in "produced" tab */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
            <div className="flex gap-1 border rounded-lg px-2 py-1 bg-white shadow-inner w-full max-w-xs">
              <input
                type="text"
                placeholder="Search batch number..."
                value={batchSearch}
                onChange={e => setBatchSearch(e.target.value)}
                className="flex-1 outline-none bg-transparent text-sm"
              />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button 
                className={`px-3 py-1 rounded-lg border ${batchTab==="in-stock"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                onClick={() => setBatchTab("in-stock")}
              >
                In Stock
              </button>
              <button 
                className={`px-3 py-1 rounded-lg border ${batchTab==="movements"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                onClick={() => setBatchTab("movements")}
              >
                Stock Movements
              </button>
              <button 
                className={`px-3 py-1 rounded-lg border ${batchTab==="clear"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                onClick={() => setBatchTab("clear")}
              >
                Clear/Used
              </button>
            </div>
          </div>

          {/* Tab Content for produced batches */}
          {batchTab === "in-stock" && (
            <BatchesInStockTable
              batches={batchesInStock}
              isLoading={isLoadingStock}
              onBatchClick={setSelectedBatch}
            />
          )}

          {batchTab === "movements" && (
            <>
              <BatchesInStockTable
                batches={allBatches}
                isLoading={isLoadingAll}
                onBatchClick={setSelectedBatch}
              />
              {selectedBatch && (
                <BatchMovementsTable 
                  batchId={selectedBatch.id}
                  batchNumber={selectedBatch.batch_number}
                  onClose={() => setSelectedBatch(null)}
                />
              )}
            </>
          )}

          {batchTab === "clear" && (
            <BatchesInStockTable
              batches={allBatches.filter(b => b.packages_in_stock < b.packages_produced)}
              isLoading={isLoadingAll}
              onBatchClick={setSelectedBatch}
            />
          )}
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-6">
          {/* No search or batch filters here */}
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
          {/* No search or batch filters here */}
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
