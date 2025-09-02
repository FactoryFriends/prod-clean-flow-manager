
import { useCreateDispatch } from "@/hooks/useDispatchData";
import { useToast } from "@/hooks/use-toast";
import { SelectedItem } from "@/types/dispatch";
import { supabase } from "@/integrations/supabase/client";

interface UseInternalDispatchOperationsProps {
  pickerName: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  onSuccess: () => void;
}

export function useInternalDispatchOperations({
  pickerName,
  selectedItems,
  currentLocation,
  onSuccess
}: UseInternalDispatchOperationsProps): { handleInternalUse: () => Promise<string> } {
  const createDispatch = useCreateDispatch();
  const { toast } = useToast();

  const handleInternalUse = async (): Promise<string> => {
    try {
      console.log("🚀 CREATE PICK clicked:", { pickerName, selectedItems: selectedItems.length, currentLocation });
      
      // Cancel any existing draft dispatches for this location to ensure only one pending pick
      console.log("🧹 Checking for existing draft dispatches...");
      const { error: cancelError } = await supabase
        .from("dispatch_records")
        .update({ status: "cancelled" })
        .eq("dispatch_type", "internal")
        .eq("status", "draft")
        .eq("location", currentLocation);

      if (cancelError) {
        console.warn("Warning: Could not cancel existing drafts:", cancelError);
      } else {
        console.log("✅ Cancelled any existing draft dispatches");
      }

      const result = await createDispatch.mutateAsync({
        dispatchType: "internal",
        customer: undefined,
        pickerName,
        dispatchNotes: "",
        selectedItems,
        currentLocation,
        status: "draft", // Internal dispatches start as drafts, need confirmation
      });

      console.log("✅ Internal pick created with ID:", result.id);

      toast({
        title: "Internal Pick Created",
        description: `Internal pick created with ${selectedItems.length} items. Click CONFIRM PICKUP to update inventory.`,
      });

      onSuccess();
      
      // Return the dispatch ID for progressive workflow
      return result.id;

    } catch (error) {
      console.error("❌ Error logging internal use:", error);
      toast({
        title: "Error",
        description: "Failed to log internal use. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    handleInternalUse
  };
}
