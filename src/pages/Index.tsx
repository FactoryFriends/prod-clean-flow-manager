
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Production } from "@/components/Production";
import { Distribution } from "@/components/Distribution";
import { CleaningTasks } from "@/components/CleaningTasks";
import { Settings } from "@/components/Settings";
import { Invoicing } from "@/components/Invoicing";
import { Reports } from "@/components/Reports";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard currentLocation={currentLocation} onSectionChange={setActiveTab} />;
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
        return <Reports currentLocation={currentLocation} />;
      default:
        return <Dashboard currentLocation={currentLocation} onSectionChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        activeSection={activeTab} 
        onSectionChange={setActiveTab}
        isCollapsed={isMobile ? true : sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />
      <main className={`flex-1 transition-all duration-300 ${
        isMobile ? 'p-4' : 'p-6'
      } overflow-auto`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
