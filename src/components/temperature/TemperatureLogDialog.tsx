import { useState, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Thermometer, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useTemperatureEquipment, useRecordTemperatures, useTodayTemperatureStatus, TemperatureEquipment } from "@/hooks/useTemperatureLogs";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { cn } from "@/lib/utils";

interface TemperatureLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: "tothai" | "khin";
}

interface TemperatureInput {
  equipment_id: string;
  value: string;
  temperature: number | null;
  is_within_range: boolean;
}

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

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: nl });

  // Initialize temperature inputs when equipment loads
  useEffect(() => {
    if (equipment) {
      const initial: Record<string, TemperatureInput> = {};
      equipment.forEach((eq) => {
        initial[eq.id] = {
          equipment_id: eq.id,
          value: "",
          temperature: null,
          is_within_range: true,
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
          initial[eq.id] = {
            equipment_id: eq.id,
            value: "",
            temperature: null,
            is_within_range: true,
          };
        });
        setTemperatures(initial);
      }
    }
  }, [open, equipment]);

  const handleTemperatureChange = (equipmentId: string, value: string, eq: TemperatureEquipment) => {
    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue);
    
    let isWithinRange = true;
    if (isValid && eq.max_temp !== null) {
      isWithinRange = numValue <= eq.max_temp;
    }

    setTemperatures((prev) => ({
      ...prev,
      [equipmentId]: {
        equipment_id: equipmentId,
        value,
        temperature: isValid ? numValue : null,
        is_within_range: isWithinRange,
      },
    }));
  };

  const handleSubmit = () => {
    if (!equipment) return;

    const validTemperatures = Object.values(temperatures)
      .filter((t) => t.temperature !== null)
      .map((t) => ({
        equipment_id: t.equipment_id,
        temperature: t.temperature!,
        is_within_range: t.is_within_range,
      }));

    recordMutation.mutate(
      {
        location,
        temperatures: validTemperatures,
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
  
  const allFilled = equipment?.every((eq) => temperatures[eq.id]?.temperature !== null) ?? false;
  const canSubmit = allFilled && selectedStaff !== "";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Thermometer className="h-5 w-5" />
            Temperaturen Registreren
          </DialogTitle>
          <p className="text-sm text-muted-foreground capitalize">{today}</p>
        </DialogHeader>

        {todayStatus?.isRecorded && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vandaag al geregistreerd door <strong>{todayStatus.recordedBy}</strong>.
              Nieuwe invoer zal de bestaande gegevens overschrijven.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Freezers section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Diepvriezers</h3>
              <span className="text-sm text-muted-foreground">(moet ≤ -18°C zijn)</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {freezers.map((eq) => {
                const temp = temperatures[eq.id];
                const hasValue = temp?.temperature !== null;
                const isOK = temp?.is_within_range ?? true;

                return (
                  <div key={eq.id} className="space-y-1">
                    <Label className="text-center block font-medium">{eq.code}</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="-20"
                        value={temp?.value || ""}
                        onChange={(e) => handleTemperatureChange(eq.id, e.target.value, eq)}
                        className={cn(
                          "text-center text-lg h-14 font-mono",
                          hasValue && isOK && "border-green-500 bg-green-50 dark:bg-green-950",
                          hasValue && !isOK && "border-red-500 bg-red-50 dark:bg-red-950"
                        )}
                      />
                    </div>
                    {hasValue && (
                      <div className="flex justify-center">
                        {isOK ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium">TE WARM!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fridges section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Koelkasten</h3>
              <span className="text-sm text-muted-foreground">(moet ≤ +7°C zijn)</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {fridges.map((eq) => {
                const temp = temperatures[eq.id];
                const hasValue = temp?.temperature !== null;
                const isOK = temp?.is_within_range ?? true;

                return (
                  <div key={eq.id} className="space-y-1">
                    <Label className="text-center block font-medium">{eq.code}</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="+4"
                        value={temp?.value || ""}
                        onChange={(e) => handleTemperatureChange(eq.id, e.target.value, eq)}
                        className={cn(
                          "text-center text-lg h-14 font-mono",
                          hasValue && isOK && "border-green-500 bg-green-50 dark:bg-green-950",
                          hasValue && !isOK && "border-red-500 bg-red-50 dark:bg-red-950"
                        )}
                      />
                    </div>
                    {hasValue && (
                      <div className="flex justify-center">
                        {isOK ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium">TE WARM!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff selection */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Geregistreerd door</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Kies personeelslid" />
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
            <Label>Opmerkingen (optioneel)</Label>
            <Textarea
              placeholder="Bijv. D-06 maakt raar geluid..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || recordMutation.isPending}
          >
            {recordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              "Opslaan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
