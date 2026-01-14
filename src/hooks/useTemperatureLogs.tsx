import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface TemperatureEquipment {
  id: string;
  code: string;
  name: string | null;
  equipment_type: "freezer" | "fridge";
  min_temp: number | null;
  max_temp: number | null;
  location: "tothai" | "khin";
  sort_order: number;
  active: boolean;
}

export interface TemperatureLog {
  id: string;
  log_date: string;
  location: "tothai" | "khin";
  equipment_id: string;
  temperature: number;
  is_within_range: boolean;
  recorded_by: string | null;
  recorded_at: string;
  notes: string | null;
}

export interface TemperatureLogWithEquipment extends TemperatureLog {
  equipment: TemperatureEquipment;
}

export interface RecordTemperatureInput {
  equipment_id: string;
  temperature: number;
  is_within_range: boolean;
}

export const useTemperatureEquipment = (location: "tothai" | "khin") => {
  return useQuery({
    queryKey: ["temperature-equipment", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temperature_equipment")
        .select("*")
        .eq("location", location)
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TemperatureEquipment[];
    },
  });
};

export const useTemperatureLogs = (
  location: "tothai" | "khin",
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: ["temperature-logs", location, format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temperature_logs")
        .select(`
          *,
          equipment:temperature_equipment(*)
        `)
        .eq("location", location)
        .gte("log_date", format(startDate, "yyyy-MM-dd"))
        .lte("log_date", format(endDate, "yyyy-MM-dd"))
        .order("log_date", { ascending: false });

      if (error) throw error;
      return data as TemperatureLogWithEquipment[];
    },
  });
};

export const useTodayTemperatureStatus = (location: "tothai" | "khin") => {
  const today = format(new Date(), "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["temperature-logs-today", location, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temperature_logs")
        .select("id, recorded_by, recorded_at")
        .eq("location", location)
        .eq("log_date", today)
        .limit(1);

      if (error) throw error;
      
      return {
        isRecorded: data && data.length > 0,
        recordedBy: data?.[0]?.recorded_by || null,
        recordedAt: data?.[0]?.recorded_at || null,
      };
    },
  });
};

export const useRecordTemperatures = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      location,
      temperatures,
      recordedBy,
      notes,
    }: {
      location: "tothai" | "khin";
      temperatures: RecordTemperatureInput[];
      recordedBy: string;
      notes?: string;
    }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Use upsert to insert or update existing logs (avoids duplicate key errors)
      const logsToInsert = temperatures.map((t) => ({
        log_date: today,
        location,
        equipment_id: t.equipment_id,
        temperature: t.temperature,
        is_within_range: t.is_within_range,
        recorded_by: recordedBy,
        notes,
      }));

      const { error } = await supabase
        .from("temperature_logs")
        .upsert(logsToInsert, { 
          onConflict: 'log_date,equipment_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["temperature-logs"] });
      queryClient.invalidateQueries({ queryKey: ["temperature-logs-today"] });
      toast({
        title: "Temperaturen opgeslagen",
        description: "De temperaturen van vandaag zijn succesvol geregistreerd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
