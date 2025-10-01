import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { parseStockVerificationExcel, type ParsedStockVerification } from "@/utils/excel/stockVerificationParser";
import { useBulkStockAdjustment } from "@/hooks/useBulkStockAdjustment";
import { Progress } from "@/components/ui/progress";

export function BulkStockAdjustment() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStockVerification | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [adjustedBy, setAdjustedBy] = useState("");
  const [reason, setReason] = useState("Bulk stock verification");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { matchBatchesToDatabase, executeBulkAdjustment, progress } = useBulkStockAdjustment();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);
    setMatches([]);
    setResult(null);

    try {
      const parsed = await parseStockVerificationExcel(selectedFile);
      setParsedData(parsed);

      // Auto-match batches
      const matched = await matchBatchesToDatabase(parsed.rows);
      setMatches(matched);

      // Auto-fill stocktaker name if available
      if (parsed.stocktakerName && !adjustedBy) {
        setAdjustedBy(parsed.stocktakerName);
      }
    } catch (error: any) {
      console.error("Parse error:", error);
      alert(`Failed to parse file: ${error.message}`);
    }
  };

  const handleExecute = async () => {
    if (!adjustedBy.trim()) {
      alert("Please enter who is adjusting the stock");
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a reason for the adjustment");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await executeBulkAdjustment.mutateAsync({
        matches,
        adjustedBy,
        reason
      });
      setResult(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const validMatches = matches.filter(m => m.batchId && !m.error);
  const invalidMatches = matches.filter(m => !m.batchId || m.error);
  const hasAdjustments = validMatches.some(m => m.row.adjustment !== 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Bulk Stock Adjustment
        </CardTitle>
        <CardDescription>
          Upload a stock verification Excel file to adjust multiple batches at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Stock Verification File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Parsed Data Preview */}
        {parsedData && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Found {parsedData.rows.length} batches in the file
                {parsedData.stocktakerName && ` • Verified by: ${parsedData.stocktakerName}`}
                {parsedData.verificationDate && ` • Date: ${parsedData.verificationDate}`}
              </AlertDescription>
            </Alert>

            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adjusted-by">Adjusted By *</Label>
                <Input
                  id="adjusted-by"
                  value={adjustedBy}
                  onChange={(e) => setAdjustedBy(e.target.value)}
                  placeholder="Your name"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Physical stock count"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Invalid Batches Warning */}
            {invalidMatches.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  {invalidMatches.length} batch(es) not found in database and will be skipped
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">System Stock</TableHead>
                      <TableHead className="text-right">Physical Count</TableHead>
                      <TableHead className="text-right">Adjustment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match, idx) => (
                      <TableRow key={idx} className={match.error ? "bg-destructive/10" : ""}>
                        <TableCell>
                          {match.error ? (
                            <XCircle className="w-4 h-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{match.row.batchNumber}</TableCell>
                        <TableCell>{match.row.productName}</TableCell>
                        <TableCell className="text-right">{match.row.systemStock}</TableCell>
                        <TableCell className="text-right font-semibold">{match.row.physicalCount}</TableCell>
                        <TableCell className={`text-right font-semibold ${
                          match.row.adjustment > 0 ? "text-green-600" : 
                          match.row.adjustment < 0 ? "text-red-600" : 
                          "text-muted-foreground"
                        }`}>
                          {match.row.adjustment > 0 ? "+" : ""}{match.row.adjustment}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {validMatches.length} valid batches • {invalidMatches.length} skipped
                </p>
                {hasAdjustments && (
                  <p className="text-sm text-muted-foreground">
                    {validMatches.filter(m => m.row.adjustment !== 0).length} adjustments needed
                  </p>
                )}
              </div>
              <Button
                onClick={handleExecute}
                disabled={!hasAdjustments || !adjustedBy.trim() || !reason.trim() || isProcessing}
                size="lg"
              >
                {isProcessing ? "Processing..." : "Execute Adjustments"}
              </Button>
            </div>

            {/* Progress */}
            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing adjustments...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <Progress value={(progress.current / progress.total) * 100} />
              </div>
            )}

            {/* Result */}
            {result && (
              <Alert variant={result.failed === 0 ? "default" : "destructive"}>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-semibold">
                    Successfully adjusted {result.successful} batches
                    {result.failed > 0 && ` • ${result.failed} failed`}
                  </p>
                  {result.errors.length > 0 && (
                    <ul className="mt-2 text-sm space-y-1">
                      {result.errors.map((err: any, idx: number) => (
                        <li key={idx}>
                          {err.batchNumber}: {err.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
