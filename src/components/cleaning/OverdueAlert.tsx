
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OverdueAlertProps {
  overdueCount: number;
  locationName: string;
  onClick: () => void;
}

export function OverdueAlert({ overdueCount, locationName, onClick }: OverdueAlertProps) {
  if (overdueCount === 0) return null;

  return (
    <Card 
      className="border-red-300 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors" 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Overdue Tasks Alert</h3>
            <p className="text-red-700">{overdueCount} tasks overdue at {locationName}. Click to view.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
