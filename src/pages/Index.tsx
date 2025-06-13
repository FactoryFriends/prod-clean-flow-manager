
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { Dashboard } from "@/components/Dashboard";
import { Production } from "@/components/Production";
import { Distribution } from "@/components/Distribution";
import { CleaningTasks } from "@/components/CleaningTasks";
import { Settings } from "@/components/Settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard currentLocation={currentLocation} />;
      case "production":
        return <Production currentLocation={currentLocation} />;
      case "distribution":
        return <Distribution currentLocation={currentLocation} />;
      case "cleaning":
        return <CleaningTasks currentLocation={currentLocation} />;
      case "settings":
        return <Settings currentLocation={currentLocation} />;
      default:
        return <Dashboard currentLocation={currentLocation} />;
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute top-0 left-0 h-full">
              <Sidebar
                activeSection={activeSection}
                onSectionChange={(section) => {
                  setActiveSection(section);
                  setMobileSidebarOpen(false);
                }}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
              </div>
              
              <LocationSwitcher
                currentLocation={currentLocation}
                onLocationChange={setCurrentLocation}
              />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
