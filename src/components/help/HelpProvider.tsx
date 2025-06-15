
import React, { createContext, useContext, useState } from "react";

interface HelpContextType {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  getHelpContent: (key: string) => HelpContent | undefined;
}

interface HelpContent {
  title: string;
  description: string;
  steps?: string[];
}

const helpContent: Record<string, HelpContent> = {
  // Dashboard help
  "dashboard.overview": {
    title: "Dashboard Overview",
    description: "Get a quick overview of your production, cleaning tasks, and key metrics.",
    steps: [
      "View today's production batches",
      "Check overdue cleaning tasks",
      "Monitor key performance indicators"
    ]
  },
  
  // Production help
  "production.batches": {
    title: "Production Batches",
    description: "Manage your production batches, track inventory, and monitor batch status.",
    steps: [
      "Click 'New Batch' to create a production batch",
      "Fill in product details and quantities",
      "Generate batch numbers automatically",
      "Track batch progress and completion"
    ]
  },
  "production.new-batch": {
    title: "Creating New Batch",
    description: "Create a new production batch with automatic batch number generation.",
    steps: [
      "Select a product from the dropdown",
      "Enter production date",
      "Specify quantity to produce",
      "Add any additional notes"
    ]
  },
  
  // Cleaning Tasks help
  "cleaning.overview": {
    title: "Cleaning Tasks Management",
    description: "Manage daily cleaning tasks, track completion, and ensure FAVV compliance.",
    steps: [
      "Select date to view tasks",
      "Choose location (ToThai or KHIN)",
      "Filter by role (Chef or Staff)",
      "Complete tasks and upload photos if required"
    ]
  },
  "cleaning.location-selector": {
    title: "Location Selection",
    description: "Switch between ToThai Restaurant and KHIN Restaurant to view location-specific tasks."
  },
  "cleaning.role-filter": {
    title: "Role Filtering",
    description: "Filter tasks by assigned role to see only relevant tasks for chefs or cleaning staff."
  },
  "cleaning.complete-task": {
    title: "Completing Tasks",
    description: "Mark tasks as complete and upload photos when required for FAVV compliance.",
    steps: [
      "Click the Complete button on any open task",
      "Upload photos if required by the task",
      "Task will be marked as completed with timestamp"
    ]
  },
  
  // Distribution help
  "distribution.external": {
    title: "External Dispatch",
    description: "Create packing slips for deliveries to customers and restaurants.",
    steps: [
      "Select items from available inventory",
      "Choose destination customer",
      "Generate packing slip",
      "Print for delivery documentation"
    ]
  },
  "distribution.internal": {
    title: "Internal Kitchen Use",
    description: "Log products used internally in the kitchen without creating packing slips.",
    steps: [
      "Select items used internally",
      "Record quantities consumed",
      "No packing slip needed"
    ]
  },
  
  // Settings help
  "settings.customers": {
    title: "Customer Management",
    description: "Add and manage customer information for dispatch operations."
  },
  "settings.products": {
    title: "Product Management",
    description: "Configure products, categories, and specifications for production."
  },
  "settings.task-templates": {
    title: "Task Templates",
    description: "Create recurring cleaning task templates with schedules and requirements."
  },
  "settings.staff-codes": {
    title: "Staff Access Codes",
    description: "Manage staff access codes for different roles and permissions."
  }
};

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const getHelpContent = (key: string) => {
    return helpContent[key];
  };

  return (
    <HelpContext.Provider value={{ currentSection, setCurrentSection, getHelpContent }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
