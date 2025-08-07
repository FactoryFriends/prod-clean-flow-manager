
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
      templateDialog: settingsState.templateDialogOpen,
      drinkDialog: settingsState.drinkDialogOpen
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

        <SettingsContent 
          currentLocation={currentLocation}
          {...settingsState}
          onEditProduct={settingsState.handlers.handleEditProduct}
          onEditStaffCode={settingsState.handlers.handleEditStaffCode}
          onEditTemplate={settingsState.handlers.handleEditTemplate}
          onEditChef={settingsState.handlers.handleEditChef}
          onAddNewProduct={settingsState.handlers.handleAddNewProduct}
          onAddNewDrink={settingsState.handlers.handleAddNewDrink}
          onAddNewStaffCode={settingsState.handlers.handleAddNewStaffCode}
          onAddNewTemplate={settingsState.handlers.handleAddNewTemplate}
          onAddNewChef={settingsState.handlers.handleAddNewChef}
        />

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
          drinkDialogOpen={settingsState.drinkDialogOpen}
          setDrinkDialogOpen={settingsState.setDrinkDialogOpen}
          handleDrinkSuccess={settingsState.handlers.handleDrinkSuccess}
          chefDialogOpen={settingsState.chefDialogOpen}
          setChefDialogOpen={settingsState.setChefDialogOpen}
          editingChef={settingsState.editingChef}
          handleChefSuccess={settingsState.handlers.handleChefSuccess}
        />
      </div>
    </UnitOptionsProvider>
  );
}
