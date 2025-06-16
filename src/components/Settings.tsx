
import { useState } from "react";
import { SettingsAuth } from "@/components/settings/SettingsAuth";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsContent } from "@/components/settings/SettingsContent";
import { SettingsDialogs } from "@/components/settings/SettingsDialogs";
import { SystemInfo } from "@/components/settings/SystemInfo";
import { UnitOptionsProvider } from "@/components/shared/UnitOptionsContext";
import { useSettingsHandlers } from "@/components/settings/hooks/useSettingsHandlers";
import { useDebugInfo } from "@/hooks/useDebugInfo";
import { Logger } from "@/utils/logger";

interface SettingsProps {
  currentLocation: "tothai" | "khin";
}

export function Settings({ currentLocation }: SettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const settingsState = useSettingsHandlers();

  // Debug informatie voor development
  useDebugInfo({ currentLocation, isAuthenticated }, {
    componentName: 'Settings',
    logRenders: true,
    logProps: true
  });

  Logger.trace('Settings', 'render', { 
    currentLocation, 
    isAuthenticated,
    dialogStates: {
      productDialog: settingsState.productDialogOpen,
      staffCodeDialog: settingsState.staffCodeDialogOpen,
      templateDialog: settingsState.templateDialogOpen
    }
  });

  if (!isAuthenticated) {
    return <SettingsAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <UnitOptionsProvider>
      <div className="space-y-6">
        <SettingsHeader 
          title="Settings" 
          description="Manage system configuration and data" 
        />

        <SettingsContent currentLocation={currentLocation} />

        <SystemInfo currentLocation={currentLocation} />
        
        <SettingsDialogs
          productDialogOpen={settingsState.productDialogOpen}
          setProductDialogOpen={settingsState.setProductDialogOpen}
          editingProduct={settingsState.editingProduct}
          handleProductSuccess={settingsState.handlers.handleProductSuccess}
          staffCodeDialogOpen={settingsState.staffCodeDialogOpen}
          setStaffCodeDialogOpen={settingsState.setStaffCodeDialogOpen}
          editingStaffCode={settingsState.editingStaffCode}
          handleStaffCodeSuccess={settingsState.handlers.handleStaffCodeSuccess}
          templateDialogOpen={settingsState.templateDialogOpen}
          setTemplateDialogOpen={settingsState.setTemplateDialogOpen}
          editingTemplate={settingsState.editingTemplate}
          handleTemplateSuccess={settingsState.handlers.handleTemplateSuccess}
        />
      </div>
    </UnitOptionsProvider>
  );
}
