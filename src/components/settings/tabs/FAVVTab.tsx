
import { TabsContent } from "@/components/ui/tabs";
import { FAVVReports } from "@/components/FAVVReports";

interface FAVVTabProps {
  currentLocation: "tothai" | "khin";
}

export function FAVVTab({ currentLocation }: FAVVTabProps) {
  return (
    <TabsContent value="favv" className="space-y-4">
      <FAVVReports currentLocation={currentLocation} />
    </TabsContent>
  );
}
