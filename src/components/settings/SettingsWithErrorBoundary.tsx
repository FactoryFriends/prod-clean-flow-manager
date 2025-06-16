
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Settings } from '@/components/Settings';

interface SettingsWithErrorBoundaryProps {
  currentLocation: "tothai" | "khin";
}

export function SettingsWithErrorBoundary({ currentLocation }: SettingsWithErrorBoundaryProps) {
  return (
    <ErrorBoundary componentName="Settings">
      <Settings currentLocation={currentLocation} />
    </ErrorBoundary>
  );
}
