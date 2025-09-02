import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";
import { OperationsFilters } from "./favv/OperationsFilters";
import { CleaningTasksFilters } from "./favv/CleaningTasksFilters";
import { PackingSlipsTable } from "./favv/PackingSlipsTable";
import { UnifiedOperationsTable } from "./favv/UnifiedOperationsTable";
import { StockTakesTable } from "./favv/StockTakesTable";
import { CompletedTasksTable } from "./favv/CompletedTasksTable";
import { exportPackingSlipsCSV, exportStockTakesCSV, exportCompletedTasksCSV } from "./favv/csvExportUtils";
import { useFAVVPackingSlips } from "../hooks/useFAVVPackingSlips";
import { useFAVVStockTakes } from "../hooks/useFAVVStockTakes";
import { useFAVVCompletedTasks } from "../hooks/useFAVVCompletedTasks";
import { useUnifiedOperationsData } from "../hooks/useUnifiedOperationsData";
import { Package, FileText, Brush, History } from "lucide-react";
import { BatchesInStockTable } from "./favv/BatchesInStockTable";
import { AuditTrailModal } from "./favv/AuditTrailModal";
import { Button } from "./ui/button";
import { ExpandableBatchMovementsList } from "./favv/ExpandableBatchMovementsList";
import { useBatchStock } from "@/hooks/useBatchStock";

interface FAVVReportsProps {
  currentLocation: "tothai" | "khin";
}

export function FAVVReports({ currentLocation }: FAVVReportsProps) {
  const [locationFilter, setLocationFilter] = useState<"all" | "tothai" | "khin">(currentLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [taskNameFilter, setTaskNameFilter] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<"all" | "external" | "internal">("all");
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  // Updated tabs: "in-stock", "movements", "partially-used", "fully-used"
  const [batchTab, setBatchTab] = useState<"in-stock" | "movements" | "partially-used" | "fully-used">("in-stock");
  const [batchSearch, setBatchSearch] = useState("");

  // Use the extracted hooks
  const { data: packingSlips = [], isLoading: isLoadingPackingSlips } = useFAVVPackingSlips({
    locationFilter,
    startDate,
    endDate
  });

  // Unified operations data
  const { data: unifiedOperations = [], isLoading: isLoadingOperations } = useUnifiedOperationsData({
    locationFilter,
    startDate,
    endDate,
    operationType
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
  // All batches for other tabs
  const { data: allBatches = [], isLoading: isLoadingAll } = useBatchStock({
    location: currentLocation,
    search: batchSearch,
    inStockOnly: false,
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Filter batches for partially used (have stock but less than produced)
  const partiallyUsedBatches = allBatches.filter(b => 
    b.packages_in_stock > 0 && b.packages_in_stock < b.packages_produced
  );

  // Filter batches for fully used (no stock remaining)
  const fullyUsedBatches = allBatches.filter(b => b.packages_in_stock === 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">FAVV Compliance Reports</CardTitle>
              <CardDescription>
                Complete overview of production, distribution, and cleaning compliance for FAVV inspections
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuditTrailOpen(true)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Audit Trail
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dispatched" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="dispatched" 
            className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white hover:bg-red-50 hover:text-red-600 border-red-200"
          >
            OPERATIONS
          </TabsTrigger>
          <TabsTrigger value="produced" className="flex items-center gap-2">
            Produced Batches
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            Cleaning Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produced" className="space-y-6">
          {/* Search and batch filters only in "produced" tab */}
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
                className={`px-3 py-1 rounded-lg border ${batchTab==="partially-used"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                onClick={() => setBatchTab("partially-used")}
              >
                Partially Used
              </button>
              <button 
                className={`px-3 py-1 rounded-lg border ${batchTab==="fully-used"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                onClick={() => setBatchTab("fully-used")}
              >
                Fully Used
              </button>
            </div>
          </div>

          {/* Tab Content for produced batches */}
          {batchTab === "in-stock" && (
            <BatchesInStockTable
              batches={batchesInStock}
              isLoading={isLoadingStock}
            />
          )}

          {batchTab === "movements" && (
            <ExpandableBatchMovementsList
              batches={allBatches}
              isLoading={isLoadingAll}
            />
          )}

          {batchTab === "partially-used" && (
            <BatchesInStockTable
              batches={partiallyUsedBatches}
              isLoading={isLoadingAll}
            />
          )}

          {batchTab === "fully-used" && (
            <BatchesInStockTable
              batches={fullyUsedBatches}
              isLoading={isLoadingAll}
            />
          )}
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-6">
          <OperationsFilters
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={() => exportPackingSlipsCSV(unifiedOperations.filter(op => op.type === 'EXTERNAL').map(op => op.details))}
            exportDisabled={!unifiedOperations.length}
            title="Operations Overview"
            description="Filter and view all external and internal dispatch operations"
          />

          <UnifiedOperationsTable 
            operations={unifiedOperations} 
            isLoading={isLoadingOperations}
            operationType={operationType}
            onOperationTypeChange={setOperationType}
          />
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

      <AuditTrailModal
        isOpen={auditTrailOpen}
        onClose={() => setAuditTrailOpen(false)}
      />
    </div>
  );
}
