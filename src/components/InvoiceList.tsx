
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, FileText } from "lucide-react";

interface InvoiceListProps {
  currentLocation: "tothai" | "khin";
  filterPeriod: "all" | "current" | "custom";
  customStartDate: string;
  customEndDate: string;
}

export function InvoiceList({ currentLocation, filterPeriod, customStartDate, customEndDate }: InvoiceListProps) {
  // Mock data for now - this will be replaced with actual data from Supabase
  const mockInvoices = [
    {
      id: "1",
      invoiceNumber: "KHIN-202406-001",
      billingPeriodStart: "2024-06-01",
      billingPeriodEnd: "2024-06-14",
      totalAmount: 1250.50,
      status: "sent",
      itemCount: 8
    },
    {
      id: "2", 
      invoiceNumber: "KHIN-202405-002",
      billingPeriodStart: "2024-05-15",
      billingPeriodEnd: "2024-05-31",
      totalAmount: 980.25,
      status: "paid",
      itemCount: 6
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Concept</Badge>;
      case "sent":
        return <Badge variant="default">Verzonden</Badge>;
      case "paid":
        return <Badge variant="outline" className="text-green-600 border-green-600">Betaald</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Factuur Overzicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Geen facturen gevonden voor de geselecteerde periode.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factuurnummer</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
                    </TableCell>
                    <TableCell>{invoice.itemCount} producten</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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
