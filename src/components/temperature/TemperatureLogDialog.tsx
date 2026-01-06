import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Thermometer, Info, MapPin } from "lucide-react";
import { useTemperatureEquipment, useRecordTemperatures, useTodayTemperatureStatus, TemperatureEquipment } from "@/hooks/useTemperatureLogs";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { TemperatureStepper } from "./TemperatureStepper";

interface TemperatureLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: "tothai" | "khin";
}

interface TemperatureInput {
  equipment_id: string;
  temperature: number;
  is_within_range: boolean;
}

const DEFAULT_FREEZER_TEMP = -20;
const DEFAULT_FRIDGE_TEMP = 4;

export function TemperatureLogDialog({
  open,
  onOpenChange,
  location,
}: TemperatureLogDialogProps) {
  const [temperatures, setTemperatures] = useState<Record<string, TemperatureInput>>({});
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const { data: equipment, isLoading: equipmentLoading } = useTemperatureEquipment(location);
  const { data: todayStatus, isLoading: statusLoading } = useTodayTemperatureStatus(location);
  const { data: staffCodes } = useStaffCodes();
  const recordMutation = useRecordTemperatures();

  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const locationDisplay = location === "tothai" ? "TOTHAI" : "KHIN";

  // Helper to check if temperature is within range
  const checkWithinRange = (temp: number, eq: TemperatureEquipment): boolean => {
    if (eq.max_temp !== null) {
      return temp <= eq.max_temp;
    }
    return true;
  };

  // Initialize temperature inputs when equipment loads
  useEffect(() => {
    if (equipment) {
      const initial: Record<string, TemperatureInput> = {};
      equipment.forEach((eq) => {
        const defaultTemp = eq.equipment_type === "freezer" ? DEFAULT_FREEZER_TEMP : DEFAULT_FRIDGE_TEMP;
        initial[eq.id] = {
          equipment_id: eq.id,
          temperature: defaultTemp,
          is_within_range: checkWithinRange(defaultTemp, eq),
        };
      });
      setTemperatures(initial);
    }
  }, [equipment]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedStaff("");
      setNotes("");
      if (equipment) {
        const initial: Record<string, TemperatureInput> = {};
        equipment.forEach((eq) => {
          const defaultTemp = eq.equipment_type === "freezer" ? DEFAULT_FREEZER_TEMP : DEFAULT_FRIDGE_TEMP;
          initial[eq.id] = {
            equipment_id: eq.id,
            temperature: defaultTemp,
            is_within_range: checkWithinRange(defaultTemp, eq),
          };
        });
        setTemperatures(initial);
      }
    }
  }, [open, equipment]);

  const handleTemperatureChange = (equipmentId: string, value: number, eq: TemperatureEquipment) => {
    const isWithinRange = checkWithinRange(value, eq);

    setTemperatures((prev) => ({
      ...prev,
      [equipmentId]: {
        equipment_id: equipmentId,
        temperature: value,
        is_within_range: isWithinRange,
      },
    }));
  };

  const handleSubmit = () => {
    if (!equipment) return;

    const temperatureData = Object.values(temperatures).map((t) => ({
      equipment_id: t.equipment_id,
      temperature: t.temperature,
      is_within_range: t.is_within_range,
    }));

    recordMutation.mutate(
      {
        location,
        temperatures: temperatureData,
        recordedBy: selectedStaff,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const freezers = equipment?.filter((eq) => eq.equipment_type === "freezer") || [];
  const fridges = equipment?.filter((eq) => eq.equipment_type === "fridge") || [];
  
  const canSubmit = selectedStaff !== "" && Object.keys(temperatures).length > 0;

  const activeStaffCodes = staffCodes?.filter((s) => s.active) || [];

  if (equipmentLoading || statusLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Thermometer className="h-5 w-5" />
            Record Temperatures
          </DialogTitle>
        </DialogHeader>

        {/* Location banner */}
        <div className="bg-primary text-primary-foreground rounded-lg py-3 px-4 flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" />
          <span className="text-xl font-bold tracking-wide">{locationDisplay}</span>
        </div>
        
        <p className="text-sm text-muted-foreground text-center">{today}</p>

        {todayStatus?.isRecorded && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Already recorded today by <strong>{todayStatus.recordedBy}</strong>.
              New entry will overwrite existing data.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Freezers section */}
          {freezers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Freezers</h3>
                <span className="text-sm text-muted-foreground">(must be ≤ -18°C)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {freezers.map((eq) => {
                  const temp = temperatures[eq.id];
                  return (
                    <TemperatureStepper
                      key={eq.id}
                      equipmentCode={eq.code}
                      value={temp?.temperature ?? DEFAULT_FREEZER_TEMP}
                      onChange={(value) => handleTemperatureChange(eq.id, value, eq)}
                      maxValid={eq.max_temp ?? -18}
                      isWithinRange={temp?.is_within_range ?? true}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Fridges section */}
          {fridges.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Fridges</h3>
                <span className="text-sm text-muted-foreground">(must be ≤ +7°C)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {fridges.map((eq) => {
                  const temp = temperatures[eq.id];
                  return (
                    <TemperatureStepper
                      key={eq.id}
                      equipmentCode={eq.code}
                      value={temp?.temperature ?? DEFAULT_FRIDGE_TEMP}
                      onChange={(value) => handleTemperatureChange(eq.id, value, eq)}
                      maxValid={eq.max_temp ?? 7}
                      isWithinRange={temp?.is_within_range ?? true}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff selection */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Recorded by</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {activeStaffCodes.map((staff) => (
                  <SelectItem key={staff.code} value={staff.code}>
                    {staff.name} ({staff.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="E.g., D-06 making strange noise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || recordMutation.isPending}
            className="min-w-[100px]"
          >
            {recordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
