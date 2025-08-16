import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react";
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

  // Counts
  const ingredientCount = allProducts.filter(p => p.product_type === "extern").length;
  const semiFinishedCount = allProducts.filter(p => p.product_type === "zelfgemaakt").length;

  // Ingredients handlers
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
        toast.error(`Import completed with ${errors.length} errors`);
      } else {
        toast.success(`Successfully imported/updated ${results.length} products`);
      }
      
      setSemiFinishedImportComplete(true);
    } catch (error) {
      toast.error("Import failed. Please check the file format.");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import/Export Manager
        </CardTitle>
        <CardDescription>
          Manage bulk data operations for ingredients and semi-finished products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ingredients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Ingredients ({ingredientCount})
            </TabsTrigger>
            <TabsTrigger value="semi-finished" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Semi-Finished ({semiFinishedCount})
            </TabsTrigger>
          </TabsList>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-4">
            {!importComplete ? (
              <div className="space-y-4">
                {/* Export */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => exportIngredientsToExcel(allProducts)}
                    variant="outline"
                    size="sm"
                    disabled={ingredientCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export ({ingredientCount})
                  </Button>
                  <Button 
                    onClick={downloadExcelTemplate} 
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Get Template
                  </Button>
                </div>

                <Separator />

                {/* Import */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                      className="max-w-sm"
                    />
                    {file && (
                      <Badge variant="secondary">
                        <FileSpreadsheet className="w-3 h-3 mr-1" />
                        {file.name}
                      </Badge>
                    )}
                  </div>

                  {validationResults && (
                    <div className="space-y-2">
                      {validationResults.errors?.length > 0 && (
                        <Alert variant="destructive">
                          <XCircle className="w-4 h-4" />
                          <AlertDescription>
                            {validationResults.errors.length} errors found
                          </AlertDescription>
                        </Alert>
                      )}

                      {validationResults.warnings?.length > 0 && (
                        <Alert>
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription>
                            {validationResults.warnings.length} warnings
                          </AlertDescription>
                        </Alert>
                      )}

                      {validationResults.valid?.length > 0 && (
                        <>
                          <Alert>
                            <CheckCircle className="w-4 h-4" />
                            <AlertDescription>
                              {validationResults.valid.length} items ready to import
                            </AlertDescription>
                          </Alert>

                          <ImportPreview validationResults={validationResults} />

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleImport}
                              disabled={isProcessing || bulkCreateMutation.isPending}
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isProcessing || bulkCreateMutation.isPending ? "Importing..." : `Import ${validationResults.valid.length}`}
                            </Button>
                            <Button variant="outline" onClick={resetImport} size="sm">
                              Reset
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="font-semibold">Import Complete!</h3>
                <Button onClick={resetImport} size="sm">Import More</Button>
              </div>
            )}
          </TabsContent>

          {/* Semi-Finished Products Tab */}
          <TabsContent value="semi-finished" className="space-y-4">
            {!semiFinishedImportComplete ? (
              <div className="space-y-4">
                {/* Export */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => exportSemiFinishedToExcel(allProducts)}
                    variant="outline"
                    size="sm"
                    disabled={semiFinishedCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel ({semiFinishedCount})
                  </Button>
                  <Button 
                    onClick={() => exportSemiFinishedToCSV(allProducts)}
                    variant="outline"
                    size="sm"
                    disabled={semiFinishedCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                <Separator />

                {/* Import */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleSemiFinishedFileSelect}
                      disabled={semiFinishedProcessing}
                      className="max-w-sm"
                    />
                    {semiFinishedFile && (
                      <Badge variant="secondary">
                        <FileSpreadsheet className="w-3 h-3 mr-1" />
                        {semiFinishedFile.name}
                      </Badge>
                    )}
                  </div>

                  {semiFinishedValidation && (
                    <div className="space-y-2">
                      {semiFinishedValidation.errors.length > 0 && (
                        <Alert variant="destructive">
                          <XCircle className="w-4 h-4" />
                          <AlertDescription>
                            {semiFinishedValidation.errors.length} errors found
                          </AlertDescription>
                        </Alert>
                      )}

                      {semiFinishedValidation.warnings.length > 0 && (
                        <Alert>
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription>
                            {semiFinishedValidation.warnings.length} warnings
                          </AlertDescription>
                        </Alert>
                      )}

                      {semiFinishedValidation.valid && semiFinishedParsedData.length > 0 && (
                        <>
                          <Alert>
                            <CheckCircle className="w-4 h-4" />
                            <AlertDescription>
                              {semiFinishedParsedData.length} items ready to import/update
                            </AlertDescription>
                          </Alert>

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSemiFinishedImport}
                              disabled={semiFinishedProcessing}
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {semiFinishedProcessing ? "Importing..." : `Import ${semiFinishedParsedData.length}`}
                            </Button>
                            <Button variant="outline" onClick={resetSemiFinishedImport} size="sm">
                              Reset
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="font-semibold">Import Complete!</h3>
                <Button onClick={resetSemiFinishedImport} size="sm">Import More</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}