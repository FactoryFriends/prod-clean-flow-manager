
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { downloadExcelTemplate } from "./excel/templateGenerator";
import { parseExcelFile, validateIngredientData } from "./excel/excelParser";
import { ImportPreview } from "./excel/ImportPreview";
import { useBulkCreateIngredients } from "./excel/useBulkCreateIngredients";
import { useAllSuppliers } from "@/hooks/useSuppliers";
import { useAllProducts } from "@/hooks/useProductionData";
import { exportIngredientsToExcel } from "./excel/ingredientExporter";

export function ExcelImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const bulkCreateMutation = useBulkCreateIngredients();
  const { data: suppliers = [] } = useAllSuppliers();
  const { data: allProducts = [] } = useAllProducts();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const data = await parseExcelFile(selectedFile);
      setParsedData(data);
      
      const validation = await validateIngredientData(data, suppliers);
      setValidationResults(validation);
    } catch (error) {
      console.error("Error parsing file:", error);
      setValidationResults({
        valid: [],
        errors: [{ row: 0, error: "Failed to parse Excel file" }],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!validationResults?.valid?.length) return;

    setIsProcessing(true);
    try {
      await bulkCreateMutation.mutateAsync(validationResults.valid);
      setImportComplete(true);
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    exportIngredientsToExcel(allProducts);
  };

  const resetImport = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults(null);
    setImportComplete(false);
  };

  // Count actual ingredients (extern products)
  const ingredientCount = allProducts.filter(p => p.product_type === "extern").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel Import/Export - Ingredients
          </CardTitle>
          <CardDescription>
            Import multiple ingredients using Excel templates or export existing ingredients as backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="font-semibold">Export Current Ingredients</h3>
            <p className="text-sm text-muted-foreground">
              Download all your current ingredients ({ingredientCount} total) as Excel backup file.
            </p>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
              disabled={ingredientCount === 0}
            >
              <Download className="w-4 h-4" />
              Export {ingredientCount} Ingredients to Excel
            </Button>
          </div>

          <Separator />

          {!importComplete ? (
            <>
              {/* Step 1: Download Template */}
              <div className="space-y-3">
                <h3 className="font-semibold">Import New Ingredients</h3>
                <h4 className="font-medium">Step 1: Download Template</h4>
                <p className="text-sm text-muted-foreground">
                  Download the Excel template with validation rules, example data, and detailed instructions.
                </p>
                <Button 
                  onClick={downloadExcelTemplate} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Excel Template
                </Button>
              </div>

              {/* Step 2: Upload File */}
              <div className="space-y-3">
                <h4 className="font-medium">Step 2: Upload Your File</h4>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                    className="max-w-md"
                  />
                  {file && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      {file.name}
                    </Badge>
                  )}
                </div>
                {isProcessing && (
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                )}
              </div>

              {/* Step 3: Preview & Import */}
              {validationResults && (
                <div className="space-y-3">
                  <h4 className="font-medium">Step 3: Review & Import</h4>
                  
                  {validationResults.errors?.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="w-4 h-4" />
                      <AlertDescription>
                        Found {validationResults.errors.length} error(s) that need to be fixed before importing.
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResults.warnings?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        {validationResults.warnings.length} warning(s): suppliers will be created automatically.
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResults.valid?.length > 0 && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        {validationResults.valid.length} ingredient(s) ready to import.
                      </AlertDescription>
                    </Alert>
                  )}

                  <ImportPreview validationResults={validationResults} />

                  {validationResults.valid?.length > 0 && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleImport}
                        disabled={isProcessing || bulkCreateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isProcessing || bulkCreateMutation.isPending ? "Importing..." : `Import ${validationResults.valid.length} Ingredients`}
                      </Button>
                      <Button variant="outline" onClick={resetImport}>
                        Start Over
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Import Complete */
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h3 className="text-xl font-semibold">Import Complete!</h3>
              <p className="text-muted-foreground">
                All ingredients have been successfully imported, and any new suppliers have been created.
              </p>
              <Button onClick={resetImport}>Import More Ingredients</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
