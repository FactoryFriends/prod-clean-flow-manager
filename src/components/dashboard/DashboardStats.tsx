
import { Package, Truck, CheckCircle, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  todaysCompletedTasksCount: number;
  tasksWithPhotosCount: number;
}

export function DashboardStats({ todaysCompletedTasksCount, tasksWithPhotosCount }: DashboardStatsProps) {
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
      title: "Tasks Completed Today",
      value: todaysCompletedTasksCount.toString(),
      change: `${tasksWithPhotosCount} with photos`,
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

  return (
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
  );
}
