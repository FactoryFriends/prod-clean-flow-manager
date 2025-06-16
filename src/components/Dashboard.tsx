
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCleaningTasks } from "@/hooks/useCleaningTasks";
import { useFAVVCompletedTasks } from "@/hooks/useFAVVCompletedTasks";
import { format, startOfDay, endOfDay } from "date-fns";
import { DashboardStats } from "./dashboard/DashboardStats";
import { DashboardAlerts } from "./dashboard/DashboardAlerts";
import { DashboardQuickActions } from "./dashboard/DashboardQuickActions";
import { DashboardRecentTasks } from "./dashboard/DashboardRecentTasks";

interface DashboardProps {
  currentLocation: string;
  onSectionChange?: (section: string) => void;
}

export function Dashboard({ currentLocation, onSectionChange }: DashboardProps) {
  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  
  const { data: batches } = useProductionBatches(dbLocation);
  const { cleaningTasks, getOverdueTasksCount } = useCleaningTasks(dbLocation);

  // Get today's completed tasks
  const today = new Date();
  const { data: todaysCompletedTasks = [] } = useFAVVCompletedTasks({
    locationFilter: dbLocation,
    startDate: startOfDay(today),
    endDate: endOfDay(today),
    taskNameFilter: ""
  });

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
  const tasksWithPhotos = todaysCompletedTasks.filter(task => task.photo_urls?.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of operations at {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
        </p>
      </div>

      {/* Quick Actions moved to top */}
      <DashboardQuickActions onSectionChange={onSectionChange ?? (() => {})} />

      <DashboardAlerts 
        expiringBatches={expiringBatches}
        expiredBatches={expiredBatches}
        overdueCleaningTasks={overdueCleaningTasks}
      />

      <DashboardStats 
        todaysCompletedTasksCount={todaysCompletedTasks.length}
        tasksWithPhotosCount={tasksWithPhotos.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <DashboardRecentTasks 
          todaysCompletedTasks={todaysCompletedTasks} 
          onSectionChange={onSectionChange}
        />
      </div>
    </div>
  );
}
