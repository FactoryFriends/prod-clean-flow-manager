import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemperatureStepperProps {
  equipmentCode: string;
  value: number;
  onChange: (value: number) => void;
  maxValid: number;
  isWithinRange: boolean;
}

export function TemperatureStepper({
  equipmentCode,
  value,
  onChange,
  maxValid,
  isWithinRange,
}: TemperatureStepperProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleIncrement = () => {
    onChange(Math.round((value + 0.1) * 10) / 10);
  };

  const handleDecrement = () => {
    onChange(Math.round((value - 0.1) * 10) / 10);
  };

  const startHold = (action: () => void) => {
    action();
    intervalRef.current = setInterval(action, 150);
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Equipment code label */}
      <span className="font-semibold text-sm">{equipmentCode}</span>
      
      {/* Stepper controls */}
      <div
        className={cn(
          "flex items-center gap-1 p-2 rounded-lg border-2 transition-colors",
          isWithinRange
            ? "border-green-500 bg-green-50 dark:bg-green-950/50"
            : "border-red-500 bg-red-50 dark:bg-red-950/50"
        )}
      >
        {/* Minus button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xl font-bold shrink-0"
          onMouseDown={() => startHold(handleDecrement)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(handleDecrement)}
          onTouchEnd={stopHold}
        >
          <Minus className="h-6 w-6" />
        </Button>

        {/* Temperature value */}
        <div className="w-24 text-center flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold leading-none">
            {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">°C</span>
        </div>

        {/* Plus button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xl font-bold shrink-0"
          onMouseDown={() => startHold(handleIncrement)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(handleIncrement)}
          onTouchEnd={stopHold}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Status indicator */}
      <div className="h-5 flex items-center">
        {isWithinRange ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-semibold">TOO WARM</span>
          </div>
        )}
      </div>
    </div>
  );
}
