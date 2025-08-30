import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { Production } from "@/components/Production";
import { Distribution } from "@/components/Distribution";
import { CleaningTasks } from "@/components/CleaningTasks";
import { SettingsWithErrorBoundary } from "@/components/settings/SettingsWithErrorBoundary";
import { Invoicing } from "@/components/Invoicing";
import { Reports } from "@/components/Reports";
import { LocationHeader } from "@/components/LocationHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { RecipeManagement } from "./RecipeManagement";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { FloatingActionButton } from "@/components/navigation/FloatingActionButton";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { toast } from "sonner";

// For FAVV deep-link: keep track of FAVV subtab
const Index = React.memo(function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const isMobile = useIsMobile();
  const [favvTabActive, setFavvTabActive] = useState(false);
  const [distributionInitialTab, setDistributionInitialTab] = useState<"external" | "internal">("external");

  // Handle quick actions from FAB
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case "new-batch":
        setActiveTab("production");
        toast.success("Opening production - create new batch");
        break;
      case "new-cleaning-task":
        setActiveTab("cleaning");
        toast.success("Opening cleaning tasks - create new task");
        break;
      case "new-dispatch":
        setActiveTab("distribution");
        toast.success("Opening distribution - create new dispatch");
        break;
      default:
        console.log("Unknown quick action:", action);
    }
  }, []);

  // handle deep linking for "reports:favv" and "distribution:internal"
  const handleSectionChange = useCallback((section: string) => {
    if (section === "reports:favv") {
      setActiveTab("reports");
      setFavvTabActive(true);
    } else if (section === "distribution:internal") {
      setActiveTab("distribution");
      setDistributionInitialTab("internal");
      setFavvTabActive(false);
    } else {
      setActiveTab(section);
      setFavvTabActive(false);
      if (section !== "distribution") {
        setDistributionInitialTab("external");
      }
    }
  }, []);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard currentLocation={currentLocation} onSectionChange={handleSectionChange} />;
      case "production":
        return <Production currentLocation={currentLocation} />;
      case "distribution":
        return <Distribution currentLocation={currentLocation} initialTab={distributionInitialTab} />;
      case "cleaning":
        return <CleaningTasks currentLocation={currentLocation} />;
      case "settings":
        return <SettingsWithErrorBoundary currentLocation={currentLocation} />;
      case "invoicing":
        return <Invoicing currentLocation={currentLocation} />;
      case "reports":
        return <Reports currentLocation={currentLocation} onSectionChange={handleSectionChange} favvTabActive={favvTabActive} />;
      case "recipe-management":
        // Only allow viewing recipe management if location is 'tothai'
        if (currentLocation === "tothai") {
          return <RecipeManagement />;
        } else {
          // Fallback: show dashboard
          return <Dashboard currentLocation={currentLocation} onSectionChange={handleSectionChange} />;
        }
      default:
        return <Dashboard currentLocation={currentLocation} onSectionChange={handleSectionChange} />;
    }
  }, [activeTab, currentLocation, distributionInitialTab, favvTabActive, handleSectionChange]);

  const mobileLayout = useMemo(() => (
    <div className="flex flex-col min-h-screen">
      <MobileHeader 
        activeSection={activeTab}
        onSectionChange={handleSectionChange}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />
      
      {/* Main Content with bottom padding for navigation */}
      <main className="flex-1 pb-16 overflow-auto">
        <div className="container mx-auto p-4">
          {renderContent()}
        </div>
      </main>

      <BottomNavigation 
        activeSection={activeTab}
        onSectionChange={handleSectionChange}
        currentLocation={currentLocation}
      />

      <FloatingActionButton 
        activeSection={activeTab}
        onQuickAction={handleQuickAction}
        currentLocation={currentLocation}
      />
    </div>
  ), [activeTab, currentLocation, handleSectionChange, handleQuickAction, renderContent]);

  const desktopLayout = useMemo(() => (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header with horizontal navigation */}
      <header className="h-14 flex items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1 border">
              <img 
                src="/icon-192x192.png" 
                alt="OptiThai" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">OptiThai</h1>
              <p className="text-xs text-muted-foreground">Production Hub</p>
            </div>
          </div>
          
          {/* Horizontal Navigation */}
          <div className="ml-8">
            <TopNavigation 
              activeSection={activeTab}
              onSectionChange={handleSectionChange}
              currentLocation={currentLocation}
            />
          </div>
        </div>
        
        {/* Location switcher */}
        <LocationHeader 
          currentLocation={currentLocation}
          onLocationChange={setCurrentLocation}
        />
      </header>
      
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  ), [activeTab, currentLocation, handleSectionChange, renderContent]);

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? mobileLayout : desktopLayout}
    </div>
  );
});

export default Index;
