
import { AlertTriangle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Batch {
  id: string;
  batch_number: string;
  expiry_date: string;
  products: {
    name: string;
  };
}

interface CleaningTask {
  id: string;
  title: string;
  scheduled_date: string;
}

interface DashboardAlertsProps {
  expiringBatches: Batch[];
  expiredBatches: Batch[];
  overdueCleaningTasks: CleaningTask[];
  currentLocation?: string;
}

export function DashboardAlerts({ expiringBatches, expiredBatches, overdueCleaningTasks, currentLocation }: DashboardAlertsProps) {
  // For KHIN location, don't show expiring batches alerts
  const shouldShowExpiringBatches = currentLocation !== "khin";
  
  const hasAlerts = (shouldShowExpiringBatches && expiringBatches.length > 0) || 
                   expiredBatches.length > 0 || 
                   overdueCleaningTasks.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        Issues Requiring Attention
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shouldShowExpiringBatches && expiringBatches.length > 0 && (
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
  );
}
