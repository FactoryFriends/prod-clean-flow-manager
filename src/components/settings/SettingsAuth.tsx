
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getManagerPasscode } from "./ManagerPasscodeForm";

interface SettingsAuthProps {
  onAuthenticated: () => void;
}

export function SettingsAuth({ onAuthenticated }: SettingsAuthProps) {
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuth = () => {
    const managerCode = getManagerPasscode();
    
    if (authCode === managerCode) {
      onAuthenticated();
      setAuthError("");
    } else {
      setAuthError("Invalid manager code");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      <div className="bg-card border border-border rounded-lg p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Manager Access Required</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Enter the 4-digit manager code to access settings.
        </p>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter manager code"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            maxLength={4}
          />
          {authError && (
            <p className="text-sm text-red-600">{authError}</p>
          )}
          <Button onClick={handleAuth} className="w-full">
            Access Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
