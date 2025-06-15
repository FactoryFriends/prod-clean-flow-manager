import { Package, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface DashboardStatsProps {
  todaysCompletedTasksCount: number;
  tasksWithPhotosCount: number;
}

export function DashboardStats({ todaysCompletedTasksCount, tasksWithPhotosCount }: DashboardStatsProps) {
  // Get data for both locations
  const { data: tothaiProduction } = useProductionBatches("tothai");
  const { cleaningTasks: tothaiTasks } = useCleaningTasks("tothai");
  const { cleaningTasks: khinTasks } = useCleaningTasks("khin");

  // Calculate batches produced this week (only ToThai produces)
  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  
  const tothaiWeeklyBatches = tothaiProduction?.filter(batch => 
    isWithinInterval(new Date(batch.created_at), { start: thisWeekStart, end: thisWeekEnd })
  ).length || 0;

  // Calculate completed cleaning tasks
  const tothaiCompletedTasks = tothaiTasks?.filter(task => task.status === 'closed').length || 0;
  const khinCompletedTasks = khinTasks?.filter(task => task.status === 'closed').length || 0;
  const totalCompletedTasks = tothaiCompletedTasks + khinCompletedTasks;

  // Calculate on-time completion rates
  const calculateOnTimeRate = (tasks: any[]) => {
    const completedTasks = tasks?.filter(task => task.status === 'closed') || [];
    if (completedTasks.length === 0) return 0;
    
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.completed_at || !task.scheduled_date) return false;
      const completedDate = new Date(task.completed_at);
      const scheduledDate = new Date(task.scheduled_date);
      // Consider on-time if completed on the same day or before
      return completedDate.toDateString() <= scheduledDate.toDateString();
    });
    
    return Math.round((onTimeTasks.length / completedTasks.length) * 100);
  };

  const tothaiOnTimeRate = calculateOnTimeRate(tothaiTasks);
  const khinOnTimeRate = calculateOnTimeRate(khinTasks);

  const stats = [
    {
      title: "Produced Batches This Week",
      value: tothaiWeeklyBatches.toString(),
      change: "ToThai production facility",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Cleaning Tasks Completed",
      value: totalCompletedTasks.toString(),
      change: `ToThai: ${tothaiCompletedTasks} | Khin: ${khinCompletedTasks}`,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "On-Time Completion Rate - ToThai",
      value: `${tothaiOnTimeRate}%`,
      change: "Cleaning tasks completed on schedule",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "On-Time Completion Rate - Khin",
      value: `${khinOnTimeRate}%`,
      change: "Cleaning tasks completed on schedule",
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
