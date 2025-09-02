
import { useCreateDispatch } from "@/hooks/useDispatchData";
import { useToast } from "@/hooks/use-toast";
import { SelectedItem } from "@/types/dispatch";

interface UseInternalDispatchOperationsProps {
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  onSuccess: () => void;
}

export function useInternalDispatchOperations({
  pickerName,
  dispatchNotes,
  selectedItems,
  currentLocation,
  onSuccess
}: UseInternalDispatchOperationsProps) {
  const createDispatch = useCreateDispatch();
  const { toast } = useToast();

  const handleInternalUse = async () => {
    try {
      await createDispatch.mutateAsync({
        dispatchType: "internal",
        customer: undefined,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
        status: "draft", // Internal dispatches start as drafts, need confirmation
      });

      toast({
        title: "Internal Pick Created",
        description: `Internal pick created with ${selectedItems.length} items. Confirm pickup to update inventory.`,
      });

      onSuccess();

    } catch (error) {
      console.error("Error logging internal use:", error);
      toast({
        title: "Error",
        description: "Failed to log internal use. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleInternalUse
  };
}
