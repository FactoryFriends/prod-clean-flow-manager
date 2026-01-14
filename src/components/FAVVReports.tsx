import React, { useState } from "react";
import { subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CleaningTaskDetailsModal } from "./task/CleaningTaskDetailsModal";
import { OperationsFilters } from "./favv/OperationsFilters";
import { CleaningTasksFilters } from "./favv/CleaningTasksFilters";
import { PackingSlipsTable } from "./favv/PackingSlipsTable";
import { UnifiedOperationsTable } from "./favv/UnifiedOperationsTable";
import { StockTakesTable } from "./favv/StockTakesTable";
import { CompletedTasksTable } from "./favv/CompletedTasksTable";
import { exportPackingSlipsCSV, exportStockTakesCSV, exportCompletedTasksCSV, exportBatchesInStockCSV } from "./favv/csvExportUtils";
import { useFAVVPackingSlips } from "../hooks/useFAVVPackingSlips";
import { useFAVVStockTakes } from "../hooks/useFAVVStockTakes";
import { useFAVVCompletedTasks } from "../hooks/useFAVVCompletedTasks";
import { useUnifiedOperationsData } from "../hooks/useUnifiedOperationsData";
import { Package, FileText, Brush, History, Printer, Thermometer, FileSpreadsheet } from "lucide-react";
import { downloadStockVerificationTemplate } from "@/utils/excel/stockVerificationTemplate";
import { printStockListA4 } from "../utils/pdf/stockListPrintA4";
import { BatchesInStockTable } from "./favv/BatchesInStockTable";
import { AuditTrailModal } from "./favv/AuditTrailModal";
import { Button } from "./ui/button";
import { ExpandableBatchMovementsList } from "./favv/ExpandableBatchMovementsList";
import { useBatchStock } from "@/hooks/useBatchStock";
import { BulkStockAdjustment } from "./favv/BulkStockAdjustment";
import { TemperatureLogDialog } from "./temperature/TemperatureLogDialog";
import { TemperatureLogsTable } from "./temperature/TemperatureLogsTable";
import { useTodayTemperatureStatus } from "@/hooks/useTemperatureLogs";
import { Alert, AlertDescription } from "./ui/alert";

interface FAVVReportsProps {
  currentLocation: "tothai" | "khin";
  openTemperatureDialog?: boolean;
  onTemperatureDialogChange?: (open: boolean) => void;
}

export function FAVVReports({ 
  currentLocation, 
  openTemperatureDialog,
  onTemperatureDialogChange 
}: FAVVReportsProps) {
  const [locationFilter, setLocationFilter] = useState<"all" | "tothai" | "khin">(currentLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [taskNameFilter, setTaskNameFilter] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<"all" | "external" | "internal">("all");
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  
  // Internal state for temperature dialog, controlled by parent if provided
  const [internalTempDialogOpen, setInternalTempDialogOpen] = useState(false);
  const temperatureDialogOpen = openTemperatureDialog ?? internalTempDialogOpen;
  const setTemperatureDialogOpen = onTemperatureDialogChange ?? setInternalTempDialogOpen;

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

  // Temperature status for current location
  const { data: todayTempStatus } = useTodayTemperatureStatus(currentLocation);

  // Temperature logs date range (last 7 days)
  const tempEndDate = new Date();
  const tempStartDate = subDays(tempEndDate, 6);

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="dispatched" 
            className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white hover:bg-red-50 hover:text-red-600 border-red-200"
          >
            OPERATIONS
          </TabsTrigger>
          <TabsTrigger value="produced" className="flex items-center gap-2">
            Produced Batches
          </TabsTrigger>
          <TabsTrigger value="stock-adjustment" className="flex items-center gap-2">
            Stock Adjustment
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            Cleaning Tasks
          </TabsTrigger>
          <TabsTrigger value="temperature" className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produced" className="space-y-6">
          {/* Search and batch filters only in "produced" tab */}
          <div className="space-y-3">
            {/* Row 1: Search and Tab Navigation */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex gap-1 border rounded-lg px-2 py-1 bg-white shadow-inner w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search batch number..."
                  value={batchSearch}
                  onChange={e => setBatchSearch(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 rounded-lg border text-sm ${batchTab==="in-stock"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                  onClick={() => setBatchTab("in-stock")}
                >
                  In Stock
                </button>
                <button 
                  className={`px-3 py-1 rounded-lg border text-sm ${batchTab==="movements"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                  onClick={() => setBatchTab("movements")}
                >
                  Stock Movements
                </button>
                <button 
                  className={`px-3 py-1 rounded-lg border text-sm ${batchTab==="partially-used"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                  onClick={() => setBatchTab("partially-used")}
                >
                  Partially Used
                </button>
                <button 
                  className={`px-3 py-1 rounded-lg border text-sm ${batchTab==="fully-used"?"bg-green-100 border-green-400":"bg-white border-gray-300"}`}
                  onClick={() => setBatchTab("fully-used")}
                >
                  Fully Used
                </button>
              </div>
            </div>

            {/* Row 2: Action Buttons - Only visible for In Stock tab */}
            {batchTab === "in-stock" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportBatchesInStockCSV(batchesInStock)}
                  className="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
                  disabled={!batchesInStock.length}
                >
                  <FileText className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printStockListA4({
                    batches: batchesInStock,
                    currentLocation,
                    searchFilter: batchSearch || undefined
                  })}
                  className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={!batchesInStock.length}
                >
                  <Printer className="w-4 h-4" />
                  Print Stock List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadStockVerificationTemplate(batchesInStock, currentLocation)}
                  className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                  disabled={!batchesInStock.length}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Template
                </Button>
              </div>
            )}
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

        <TabsContent value="stock-adjustment" className="space-y-6">
          <BulkStockAdjustment />
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

        <TabsContent value="temperature" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5" />
                    Temperatuurregistratie
                  </CardTitle>
                  <CardDescription>
                    Dagelijkse temperatuurmetingen van diepvriezers en koelkasten
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setTemperatureDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Thermometer className="w-4 h-4" />
                  Temperaturen Registreren
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!todayTempStatus?.isRecorded && (
                <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
                  <Thermometer className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Let op:</strong> De temperaturen van vandaag zijn nog niet geregistreerd.
                  </AlertDescription>
                </Alert>
              )}
              <TemperatureLogsTable
                location={currentLocation}
                startDate={tempStartDate}
                endDate={tempEndDate}
              />
            </CardContent>
          </Card>
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

      <TemperatureLogDialog
        open={temperatureDialogOpen}
        onOpenChange={setTemperatureDialogOpen}
        location={currentLocation}
      />
    </div>
  );
}
