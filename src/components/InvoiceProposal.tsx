
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Package, Euro } from "lucide-react";
import { format } from "date-fns";
import { useInvoiceProposal, InvoiceProposalItem } from "@/hooks/useInvoiceProposal";

interface InvoiceProposalProps {
  currentLocation: "tothai" | "khin";
  startDate: string;
  endDate: string;
}

export function InvoiceProposal({ currentLocation, startDate, endDate }: InvoiceProposalProps) {
  const { data: proposal, isLoading, error } = useInvoiceProposal(currentLocation, startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Factuurvoorstel laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-destructive">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Fout bij het laden van factuurvoorstel</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!proposal || proposal.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Factuurvoorstel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Geen geproduceerde producten gevonden voor de geselecteerde periode.</p>
            <p className="text-sm mt-2">
              Periode: {formatDate(startDate)} - {formatDate(endDate)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Factuurvoorstel
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>Periode: {formatDate(proposal.periodStart)} - {formatDate(proposal.periodEnd)}</p>
          <p>Gebaseerd op {proposal.packingSlipCount} packing slips</p>
          <p className="text-orange-600 font-medium">Alleen zelf geproduceerde producten</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Producten</p>
                    <p className="text-lg font-semibold">{proposal.items.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Packing Slips</p>
                    <p className="text-lg font-semibold">{proposal.packingSlipCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal Bedrag</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(proposal.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Eenheid</TableHead>
                <TableHead className="text-right">Hoeveelheid</TableHead>
                <TableHead className="text-right">Prijs per Eenheid</TableHead>
                <TableHead className="text-right">Totaal Bedrag</TableHead>
                <TableHead className="text-center">Packing Slips</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposal.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.unitSize} {item.unitType}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.pricePerUnit)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.packingSlipCount}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-primary/20">
                <TableCell colSpan={4} className="font-semibold text-right">
                  Totaal te Factureren:
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-green-600">
                  {formatCurrency(proposal.totalAmount)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
