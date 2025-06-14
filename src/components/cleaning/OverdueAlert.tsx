
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OverdueAlertProps {
  overdueCount: number;
  locationName: string;
}

export function OverdueAlert({ overdueCount, locationName }: OverdueAlertProps) {
  if (overdueCount === 0) return null;

  return (
    <Card className="border-red-300 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Overdue Tasks Alert</h3>
            <p className="text-red-700">{overdueCount} tasks overdue at {locationName}.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
