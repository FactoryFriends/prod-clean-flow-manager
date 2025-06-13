
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const STORAGE_KEY = "manager_passcode";

export function ManagerPasscodeForm() {
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStoredPasscode = () => {
    return localStorage.getItem(STORAGE_KEY) || "9999"; // Default fallback
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedPasscode = getStoredPasscode();
      
      if (currentPasscode !== storedPasscode) {
        toast({
          title: "Error",
          description: "Current passcode is incorrect",
          variant: "destructive",
        });
        return;
      }

      if (newPasscode.length !== 4 || !/^\d{4}$/.test(newPasscode)) {
        toast({
          title: "Error",
          description: "New passcode must be exactly 4 digits",
          variant: "destructive",
        });
        return;
      }

      if (newPasscode !== confirmPasscode) {
        toast({
          title: "Error",
          description: "New passcode and confirmation do not match",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem(STORAGE_KEY, newPasscode);
      
      toast({
        title: "Success",
        description: "Manager passcode updated successfully",
      });

      // Clear form
      setCurrentPasscode("");
      setNewPasscode("");
      setConfirmPasscode("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update passcode",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary" />
          Manager Access Passcode
        </CardTitle>
        <CardDescription>
          Update the 4-digit passcode required to access manager settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePasscode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPasscode">Current Passcode *</Label>
            <Input
              id="currentPasscode"
              type="password"
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              placeholder="Enter current 4-digit passcode"
              maxLength={4}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPasscode">New Passcode *</Label>
            <Input
              id="newPasscode"
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="Enter new 4-digit passcode"
              maxLength={4}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPasscode">Confirm New Passcode *</Label>
            <Input
              id="confirmPasscode"
              type="password"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Confirm new 4-digit passcode"
              maxLength={4}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating..." : "Update Passcode"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Export helper function to get the current passcode
export const getManagerPasscode = () => {
  return localStorage.getItem(STORAGE_KEY) || "9999";
};
