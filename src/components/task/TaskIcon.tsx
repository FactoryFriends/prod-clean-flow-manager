
import { Brush, AlertTriangle } from "lucide-react";

interface TaskIconProps {
  isOverdue: boolean;
  severelyOverdue: boolean;
}

export function TaskIcon({ isOverdue, severelyOverdue }: TaskIconProps) {
  return (
    <div className={`p-2 rounded-lg ${
      severelyOverdue ? 'bg-red-200' : isOverdue ? 'bg-red-200' : 'bg-accent'
    }`}>
      {severelyOverdue || isOverdue ? (
        <AlertTriangle className={`w-5 h-5 ${severelyOverdue ? 'text-red-700' : 'text-red-600'}`} />
      ) : (
        <Brush className="w-5 h-5 text-primary" />
      )}
    </div>
  );
}
