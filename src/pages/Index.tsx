
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
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
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { FloatingActionButton } from "@/components/navigation/FloatingActionButton";
import { toast } from "sonner";

// For FAVV deep-link: keep track of FAVV subtab
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [favvTabActive, setFavvTabActive] = useState(false);
  const [distributionInitialTab, setDistributionInitialTab] = useState<"external" | "internal">("external");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth immediately if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

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
        /* Desktop Layout - Keep existing sidebar */
        <div className="flex w-full">
          <Sidebar 
            activeSection={activeTab}
            onSectionChange={handleSectionChange}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentLocation={currentLocation}
            onLocationChange={setCurrentLocation}
          />
          
          <div className="flex-1 flex flex-col">
            <LocationHeader 
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
            />
            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
