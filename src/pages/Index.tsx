
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Production } from "@/components/Production";
import { Distribution } from "@/components/Distribution";
import { CleaningTasks } from "@/components/CleaningTasks";
import { Settings } from "@/components/Settings";
import { Invoicing } from "@/components/Invoicing";
import { FAVVReport } from "@/components/FAVVReport";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentLocation, setCurrentLocation] = useState<"tothai" | "khin">("tothai");

  const renderContent = () => {
    switch (activeTab) {
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
      case "invoicing":
        return <Invoicing />;
      case "favv":
        return <FAVVReport />;
      default:
        return <Dashboard currentLocation={currentLocation} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
