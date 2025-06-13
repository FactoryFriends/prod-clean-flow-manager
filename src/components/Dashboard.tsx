
import { Package, Truck, CheckCircle, Clock, AlertTriangle, TrendingUp, ChefHat, ClipboardList, AlertCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { format } from "date-fns";

interface DashboardProps {
  currentLocation: string;
}

export function Dashboard({ currentLocation }: DashboardProps) {
  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  
  const { data: batches } = useProductionBatches(dbLocation);
  const { cleaningTasks, getOverdueTasksCount } = useCleaningTasks(dbLocation);

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

  // Get batches expiring within 2 days
  const getExpiringBatches = () => {
    if (!batches) return [];
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    return batches.filter(batch => {
      const expiryDate = new Date(batch.expiry_date);
      return expiryDate <= twoDaysFromNow && expiryDate > new Date();
    });
  };

  // Get expired batches
  const getExpiredBatches = () => {
    if (!batches) return [];
    const now = new Date();
    
    return batches.filter(batch => {
      const expiryDate = new Date(batch.expiry_date);
      return expiryDate <= now;
    });
  };

  // Get overdue cleaning tasks (>72 hours)
  const getOverdueCleaningTasks = () => {
    if (!cleaningTasks) return [];
    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);
    
    return cleaningTasks.filter(task => {
      if (task.status === 'closed') return false;
      const scheduledDate = new Date(task.scheduled_date);
      return scheduledDate <= seventyTwoHoursAgo;
    });
  };

  const expiringBatches = getExpiringBatches();
  const expiredBatches = getExpiredBatches();
  const overdueCleaningTasks = getOverdueCleaningTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of operations at {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
        </p>
      </div>

      {/* Alerts Section */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0 || overdueCleaningTasks.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Issues Requiring Attention
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringBatches.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Batches Expiring Soon</h3>
                </div>
                <p className="text-sm text-orange-700 mb-3">{expiringBatches.length} batch(es) expiring within 2 days</p>
                {expiringBatches.slice(0, 3).map(batch => (
                  <div key={batch.id} className="text-xs text-orange-600 mb-1">
                    {batch.batch_number} - {batch.products.name} (expires {format(new Date(batch.expiry_date), "MMM dd")})
                  </div>
                ))}
                <button 
                  onClick={() => window.location.hash = '#production'}
                  className="text-xs text-orange-700 underline hover:text-orange-800"
                >
                  View in Production →
                </button>
              </div>
            )}

            {expiredBatches.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h3 className="font-semibold text-red-800">Expired Batches</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">{expiredBatches.length} expired batch(es) need attention</p>
                {expiredBatches.slice(0, 3).map(batch => (
                  <div key={batch.id} className="text-xs text-red-600 mb-1">
                    {batch.batch_number} - {batch.products.name} (expired {format(new Date(batch.expiry_date), "MMM dd")})
                  </div>
                ))}
                <button 
                  onClick={() => window.location.hash = '#production'}
                  className="text-xs text-red-700 underline hover:text-red-800"
                >
                  View in Production →
                </button>
              </div>
            )}

            {overdueCleaningTasks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h3 className="font-semibold text-red-800">Overdue Cleaning Tasks</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">{overdueCleaningTasks.length} task(s) overdue by 72+ hours</p>
                {overdueCleaningTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="text-xs text-red-600 mb-1">
                    {task.title} (due {format(new Date(task.scheduled_date), "MMM dd")})
                  </div>
                ))}
                <button 
                  onClick={() => window.location.hash = '#cleaning'}
                  className="text-xs text-red-700 underline hover:text-red-800"
                >
                  View Cleaning Tasks →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
            <button 
              onClick={() => window.location.hash = '#production'}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Package className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">New Production</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#distribution'}
              className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Truck className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Pick Goods</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#cleaning'}
              className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              <ClipboardList className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Cleaning Tasks for Today</span>
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
