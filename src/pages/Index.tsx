
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

// For FAVV deep-link: keep track of FAVV subtab
const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const isMobile = useIsMobile();
  const [favvTabActive, setFavvTabActive] = useState(false);
  const [distributionInitialTab, setDistributionInitialTab] = useState<"external" | "internal">("external");

  // Handle quick actions from FAB
  const handleQuickAction = (action: string) => {
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
  };

  // handle deep linking for "reports:favv" and "distribution:internal"
  const handleSectionChange = (section: string) => {
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
  };

  const renderContent = () => {
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      {isMobile ? (
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
      ) : (
        /* Desktop Layout - New Shadcn Sidebar with proper logo placement */
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full">
            <AppSidebar 
              activeSection={activeTab}
              onSectionChange={handleSectionChange}
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
            />
            
            <div className="flex-1 flex flex-col">
              {/* Header with sidebar trigger - clean UX */}
              <header className="h-12 flex items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionChange("dashboard")}
                    className={`flex items-center gap-2 ${activeTab === "dashboard" ? "bg-accent" : ""}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </div>
                <LocationHeader 
                  currentLocation={currentLocation}
                  onLocationChange={setCurrentLocation}
                />
              </header>
              
              <main className="flex-1 p-6 overflow-auto">
                {renderContent()}
              </main>
            </div>
          </div>
        </SidebarProvider>
      )}
    </div>
  );
};

export default Index;
