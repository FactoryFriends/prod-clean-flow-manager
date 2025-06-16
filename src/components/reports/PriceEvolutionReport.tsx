
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductPriceHistory } from "@/hooks/useProductPriceHistory";
import { useSuppliers } from "@/hooks/useSuppliers";
import { format } from "date-fns";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { downloadCSV } from "@/components/favv/csvDownloadUtils";

interface PriceEvolutionReportProps {
  currentLocation: "tothai" | "khin";
}

export function PriceEvolutionReport({ currentLocation }: PriceEvolutionReportProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [productType, setProductType] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");

  const { data: priceHistory = [], isLoading } = useProductPriceHistory({
    startDate,
    endDate,
    productType,
    supplierId,
  });

  const { data: suppliers = [] } = useSuppliers();

  const calculatePriceChange = (oldCost: number | null, newCost: number) => {
    if (!oldCost) return null;
    const change = ((newCost - oldCost) / oldCost) * 100;
    return change;
  };

  const exportToCsv = () => {
    const csvData = priceHistory.map(record => ({
      "Product Name": record.product_name,
      "Supplier": record.supplier_name || "N/A",
      "Product Type": record.product_type,
      "Package Unit": record.supplier_package_unit || "N/A",
      "Old Price": record.old_cost ? `€${record.old_cost.toFixed(4)}` : "Initial",
      "New Price": `€${record.new_cost.toFixed(4)}`,
      "Change %": record.old_cost ? `${calculatePriceChange(record.old_cost, record.new_cost)?.toFixed(2)}%` : "N/A",
      "Changed At": format(new Date(record.changed_at), "dd/MM/yyyy HH:mm"),
      "Changed By": record.changed_by || "System",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(","))
    ].join("\n");

    const filename = `price-evolution-${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Price Evolution Report
          </CardTitle>
          <CardDescription>
            Track ingredient price changes over time with detailed analysis and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="extern">External</SelectItem>
                <SelectItem value="zelfgemaakt">Self-made</SelectItem>
                <SelectItem value="ingredient">Ingredient</SelectItem>
                <SelectItem value="semi-finished">Semi-finished</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={exportToCsv}
              disabled={!priceHistory.length}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading price history...</div>
          ) : priceHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No price changes found for the selected filters.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Package Unit</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>New Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((record) => {
                    const priceChange = calculatePriceChange(record.old_cost, record.new_cost);
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.product_name}</TableCell>
                        <TableCell>{record.supplier_name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.product_type}</Badge>
                        </TableCell>
                        <TableCell>{record.supplier_package_unit || "N/A"}</TableCell>
                        <TableCell>
                          {record.old_cost ? `€${record.old_cost.toFixed(4)}` : "Initial"}
                        </TableCell>
                        <TableCell>€{record.new_cost.toFixed(4)}</TableCell>
                        <TableCell>
                          {priceChange !== null ? (
                            <div className={`flex items-center gap-1 ${
                              priceChange > 0 ? 'text-red-600' : priceChange < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {priceChange > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : priceChange < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : null}
                              {priceChange.toFixed(2)}%
                            </div>
                          ) : (
                            <span className="text-gray-500">Initial</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.changed_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{record.changed_by || "System"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
