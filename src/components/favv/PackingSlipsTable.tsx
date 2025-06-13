
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PackingSlip {
  id: string;
  slip_number: string;
  created_at: string;
  destination: string;
  total_items: number;
  total_packages: number;
  dispatch_records?: {
    location?: string;
    dispatch_type?: string;
    picker_name?: string;
  } | null;
}

interface PackingSlipsTableProps {
  packingSlips: PackingSlip[];
  isLoading: boolean;
}

export function PackingSlipsTable({ packingSlips, isLoading }: PackingSlipsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Packing Slips ({packingSlips.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            Loading packing slips...
          </div>
        ) : !packingSlips.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No packing slips found for the selected criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slip Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Packages</TableHead>
                  <TableHead>Picker</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packingSlips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell className="font-mono text-sm">
                      {slip.slip_number}
                    </TableCell>
                    <TableCell>
                      {format(new Date(slip.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {slip.dispatch_records?.location?.toUpperCase() || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{slip.destination}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        slip.dispatch_records?.dispatch_type === "external" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      )}>
                        {slip.dispatch_records?.dispatch_type || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{slip.total_items}</TableCell>
                    <TableCell>{slip.total_packages}</TableCell>
                    <TableCell>{slip.dispatch_records?.picker_name || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
