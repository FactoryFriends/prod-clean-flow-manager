
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadExcelTemplate } from "./excel/templateGenerator";
import { parseExcelFile, validateIngredientData } from "./excel/excelParser";
import { ImportPreview } from "./excel/ImportPreview";
import { useBulkCreateIngredients } from "./excel/useBulkCreateIngredients";
import { useAllSuppliers } from "@/hooks/useSuppliers";
import { useAllProducts } from "@/hooks/useProductionData";
import { exportIngredientsToExcel } from "./excel/ingredientExporter";
import { exportSemiFinishedToCSV, exportSemiFinishedToExcel } from "./excel/semiFinishedExporter";
import { 
  parseSemiFinishedExcelFile, 
  validateSemiFinishedData, 
  convertToSemiFinishedData, 
  updateSemiFinishedProducts,
  SemiFinishedImportData,
  ValidationResult 
} from "./excel/semiFinishedImporter";

export function ExcelImport() {
  // Ingredients import state
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  // Semi-finished products import state
  const [semiFinishedFile, setSemiFinishedFile] = useState<File | null>(null);
  const [semiFinishedParsedData, setSemiFinishedParsedData] = useState<SemiFinishedImportData[]>([]);
  const [semiFinishedValidation, setSemiFinishedValidation] = useState<ValidationResult | null>(null);
  const [semiFinishedProcessing, setSemiFinishedProcessing] = useState(false);
  const [semiFinishedImportComplete, setSemiFinishedImportComplete] = useState(false);

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

  // Semi-finished products handlers
  const handleSemiFinishedFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setSemiFinishedFile(selectedFile);
    setSemiFinishedProcessing(true);
    
    try {
      const data = await parseSemiFinishedExcelFile(selectedFile);
      setSemiFinishedParsedData(data);
      
      const validation = validateSemiFinishedData(data);
      setSemiFinishedValidation(validation);
    } catch (error) {
      console.error("Error parsing semi-finished file:", error);
      setSemiFinishedValidation({
        valid: false,
        errors: ["Failed to parse Excel file"],
        warnings: []
      });
    } finally {
      setSemiFinishedProcessing(false);
    }
  };

  const handleSemiFinishedImport = async () => {
    if (!semiFinishedValidation?.valid || !semiFinishedParsedData.length) return;

    setSemiFinishedProcessing(true);
    try {
      const convertedData = convertToSemiFinishedData(semiFinishedParsedData);
      const { results, errors } = await updateSemiFinishedProducts(convertedData);
      
      if (errors.length > 0) {
        console.error("Import errors:", errors);
        toast.error(`Import completed with ${errors.length} errors. Check console for details.`);
      } else {
        toast.success(`Successfully imported/updated ${results.length} semi-finished products`);
      }
      
      setSemiFinishedImportComplete(true);
    } catch (error) {
      console.error("Semi-finished import failed:", error);
      toast.error("Import failed. Please check the file format and try again.");
    } finally {
      setSemiFinishedProcessing(false);
    }
  };

  const resetSemiFinishedImport = () => {
    setSemiFinishedFile(null);
    setSemiFinishedParsedData([]);
    setSemiFinishedValidation(null);
    setSemiFinishedImportComplete(false);
  };

  // Count actual ingredients (extern products) and semi-finished products
  const ingredientCount = allProducts.filter(p => p.product_type === "extern").length;
  const semiFinishedCount = allProducts.filter(p => p.product_type === "zelfgemaakt").length;

  const handleSemiFinishedExportCSV = () => {
    exportSemiFinishedToCSV(allProducts);
  };

  const handleSemiFinishedExportExcel = () => {
    exportSemiFinishedToExcel(allProducts);
  };

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

          {/* Semi-Finished Products Export Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export Semi-Finished Products
            </h3>
            <p className="text-sm text-muted-foreground">
              Download all your semi-finished products ({semiFinishedCount} total) in CSV or Excel format.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleSemiFinishedExportCSV}
                variant="outline"
                className="flex items-center gap-2"
                disabled={semiFinishedCount === 0}
              >
                <Download className="w-4 h-4" />
                Export to CSV
              </Button>
              <Button 
                onClick={handleSemiFinishedExportExcel}
                variant="outline"
                className="flex items-center gap-2"
                disabled={semiFinishedCount === 0}
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </div>
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

      {/* Semi-Finished Products Import/Export Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import/Export - Semi-Finished Products
          </CardTitle>
          <CardDescription>
            Import/export semi-finished products for mass updates and data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!semiFinishedImportComplete ? (
            <>
              {/* Semi-Finished Export Section */}
              <div className="space-y-3">
                <h3 className="font-semibold">Export for Editing</h3>
                <p className="text-sm text-muted-foreground">
                  Download your semi-finished products ({semiFinishedCount} total) to Excel, make changes, and re-import.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSemiFinishedExportExcel}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={semiFinishedCount === 0}
                  >
                    <Download className="w-4 h-4" />
                    Download for Editing
                  </Button>
                  <Button 
                    onClick={handleSemiFinishedExportCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={semiFinishedCount === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Semi-Finished Import Section */}
              <div className="space-y-3">
                <h3 className="font-semibold">Import Updated Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload an Excel file with semi-finished products data. Existing products will be updated, new ones will be created.
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleSemiFinishedFileSelect}
                    disabled={semiFinishedProcessing}
                    className="max-w-md"
                  />
                  {semiFinishedFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      {semiFinishedFile.name}
                    </Badge>
                  )}
                </div>
                {semiFinishedProcessing && (
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                )}
              </div>

              {/* Validation Results */}
              {semiFinishedValidation && (
                <div className="space-y-3">
                  <h4 className="font-medium">Validation Results</h4>
                  
                  {semiFinishedValidation.errors.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="w-4 h-4" />
                      <AlertDescription>
                        Found {semiFinishedValidation.errors.length} error(s):
                        <ul className="mt-2 list-disc list-inside">
                          {semiFinishedValidation.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                          {semiFinishedValidation.errors.length > 5 && (
                            <li className="text-sm">... and {semiFinishedValidation.errors.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {semiFinishedValidation.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        {semiFinishedValidation.warnings.length} warning(s) found.
                      </AlertDescription>
                    </Alert>
                  )}

                  {semiFinishedValidation.valid && semiFinishedParsedData.length > 0 && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        {semiFinishedParsedData.length} semi-finished product(s) ready to import/update.
                      </AlertDescription>
                    </Alert>
                  )}

                  {semiFinishedValidation.valid && semiFinishedParsedData.length > 0 && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSemiFinishedImport}
                        disabled={semiFinishedProcessing}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {semiFinishedProcessing ? "Importing..." : `Import/Update ${semiFinishedParsedData.length} Products`}
                      </Button>
                      <Button variant="outline" onClick={resetSemiFinishedImport}>
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
                Semi-finished products have been successfully imported/updated.
              </p>
              <Button onClick={resetSemiFinishedImport}>Import More Products</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
