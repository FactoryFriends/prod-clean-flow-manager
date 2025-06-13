
interface SystemInfoProps {
  currentLocation: string;
}

export function SystemInfo({ currentLocation }: SystemInfoProps) {
  const displayLocation = currentLocation === "tothai" ? "ToThai Production Facility" : "KHIN Restaurant";

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">System Information</h2>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Current Location: {displayLocation}</p>
        <p>Manager Access: Active</p>
        <p>Version: 1.0.0</p>
      </div>
    </div>
  );
}
