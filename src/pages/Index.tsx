import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Production } from "@/components/Production";
import { Distribution } from "@/components/Distribution";
import { CleaningTasks } from "@/components/CleaningTasks";
import { Settings } from "@/components/settings/Settings";
import { Invoicing } from "@/components/Invoicing";
import { Reports } from "@/components/Reports";
import { LocationHeader } from "@/components/LocationHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { RecipeManagement } from "./RecipeManagement";

// For FAVV deep-link: keep track of FAVV subtab
const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [favvTabActive, setFavvTabActive] = useState(false);

  // handle deep linking for "reports:favv"
  const handleSectionChange = (section: string) => {
    if (section === "reports:favv") {
      setActiveTab("reports");
      setFavvTabActive(true);
    } else {
      setActiveTab(section);
      setFavvTabActive(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard currentLocation={currentLocation} onSectionChange={handleSectionChange} />;
      case "production":
        return <Production currentLocation={currentLocation} />;
      case "distribution":
        return <Distribution currentLocation={currentLocation} />;
      case "cleaning":
        return <CleaningTasks currentLocation={currentLocation} />;
      case "settings":
        return <Settings currentLocation={currentLocation} />;
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
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        activeSection={activeTab} 
        onSectionChange={handleSectionChange}
        isCollapsed={isMobile ? true : sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />
      <div className="flex-1 flex flex-col">
        <LocationHeader 
          currentLocation={currentLocation}
          onLocationChange={setCurrentLocation}
        />
        <main className={`flex-1 transition-all duration-300 ${
          isMobile ? 'p-4' : 'p-6'
        } overflow-auto`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
