import { useState } from "react";
import { Building, Package, Truck, Brush, BarChart3, Settings, Receipt, FileText, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, availableFor: ["tothai", "khin"] },
  { id: "production", label: "Production", icon: Package, availableFor: ["tothai"] },
  { id: "distribution", label: "Distribution", icon: Truck, availableFor: ["tothai"] },
  { id: "cleaning", label: "Cleaning Tasks", icon: Brush, availableFor: ["tothai", "khin"] },
  { id: "invoicing", label: "Invoicing", icon: Receipt, availableFor: ["tothai"] },
  { id: "reports", label: "Reports", icon: FileText, availableFor: ["tothai", "khin"] },
  { id: "recipe-management", label: "Recipe Management", icon: Building, availableFor: ["tothai"] },
  { id: "settings", label: "Settings", icon: Settings, availableFor: ["tothai", "khin"] },
];

export function AppSidebar({ activeSection, onSectionChange, currentLocation, onLocationChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Filter menu items based on current location
  const availableMenuItems = menuItems.filter(item => 
    item.availableFor.includes(currentLocation)
  );

  // Keep the navigation group open if current route is active
  const isNavExpanded = availableMenuItems.some(item => item.id === activeSection);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* Clean header with just company name */}
        <div className="flex items-center gap-3 px-4 py-4">
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">OptiThai</h1>
              <p className="text-sm text-sidebar-foreground/60">Production Hub</p>
            </div>
          )}
        </div>
        
        {/* Location switcher */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="flex gap-1 bg-sidebar-accent/20 rounded-lg p-1">
              <button
                onClick={() => onLocationChange("tothai")}
                className={cn(
                  "flex-1 text-xs py-3 px-3 rounded-md transition-colors",
                  "min-h-[44px] flex items-center justify-center font-medium",
                  currentLocation === "tothai"
                    ? "bg-tothai-primary text-tothai-accent shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
                )}
              >
                ToThai
              </button>
              <button
                onClick={() => onLocationChange("khin")}
                className={cn(
                  "flex-1 text-xs py-3 px-3 rounded-md transition-colors",
                  "min-h-[44px] flex items-center justify-center font-medium",
                  currentLocation === "khin"
                    ? "bg-khin-primary text-khin-accent shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
                )}
              >
                KHIN
              </button>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {availableMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-4 py-2">
          <div className="text-xs text-sidebar-foreground/60">
            OptiThai Manager
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
