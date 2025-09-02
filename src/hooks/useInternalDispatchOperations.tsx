
import { useCreateDispatch } from "@/hooks/useDispatchData";
import { useToast } from "@/hooks/use-toast";
import { SelectedItem } from "@/types/dispatch";

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
      const result = await createDispatch.mutateAsync({
        dispatchType: "internal",
        customer: undefined,
        pickerName,
        dispatchNotes: "",
        selectedItems,
        currentLocation,
        status: "draft", // Internal dispatches start as drafts, need confirmation
      });

      toast({
        title: "Internal Pick Created",
        description: `Internal pick created with ${selectedItems.length} items. Click CONFIRM PICKUP to update inventory.`,
      });

      onSuccess();
      
      // Return the dispatch ID for progressive workflow
      return result.id;

    } catch (error) {
      console.error("Error logging internal use:", error);
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
