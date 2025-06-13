
import { Package, Truck, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface DashboardProps {
  currentLocation: string;
}

export function Dashboard({ currentLocation }: DashboardProps) {
  const stats = [
    {
      title: "Active Production",
      value: "12",
      change: "+2 from yesterday",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Pending Shipments",
      value: "8",
      change: "-1 from yesterday", 
      icon: Truck,
      color: "text-purple-600",
    },
    {
      title: "Cleaning Tasks",
      value: "5",
      change: "3 completed today",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Efficiency Rate",
      value: "94%",
      change: "+2% this week",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    { id: 1, type: "production", description: "Semi-product batch SP-001 completed", time: "2 minutes ago", status: "completed" as const },
    { id: 2, type: "distribution", description: "Shipment SH-045 dispatched to customer", time: "15 minutes ago", status: "shipped" as const },
    { id: 3, type: "cleaning", description: "Deep cleaning of Production Line 2", time: "1 hour ago", status: "in-progress" as const },
    { id: 4, type: "production", description: "Quality check for batch SP-002", time: "2 hours ago", status: "pending" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of operations at {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-accent ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <StatusBadge status={activity.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Package className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">New Production</span>
            </button>
            <button className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Truck className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Schedule Shipment</span>
            </button>
            <button className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Cleaning Task</span>
            </button>
            <button className="p-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Report Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
