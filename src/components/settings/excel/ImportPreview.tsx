
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportPreviewProps {
  validationResults: {
    valid: any[];
    errors: Array<{
      row: number;
      field?: string;
      error: string;
      data?: any;
    }>;
  };
}

export function ImportPreview({ validationResults }: ImportPreviewProps) {
  const { valid, errors } = validationResults;

  return (
    <div className="space-y-4">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-destructive flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Errors ({errors.length})
          </h4>
          <ScrollArea className="h-32 border rounded">
            <div className="p-2 space-y-1">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive" className="p-2">
                  <AlertDescription className="text-xs">
                    <strong>Row {error.row}:</strong> {error.error}
                    {error.data?.name && <span className="ml-2 text-muted-foreground">({error.data.name})</span>}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Valid Data Preview */}
      {valid.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Ready to Import ({valid.length})
          </h4>
          <ScrollArea className="h-64 border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Unit Type</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Pickable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valid.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{ingredient.supplier_name || 'N/A'}</TableCell>
                    <TableCell>{ingredient.supplier_package_unit}</TableCell>
                    <TableCell>€{ingredient.price_per_package.toFixed(2)}</TableCell>
                    <TableCell>{ingredient.units_per_package}</TableCell>
                    <TableCell>{ingredient.inner_unit_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ingredient.product_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ingredient.pickable ? "default" : "secondary"}>
                        {ingredient.pickable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
