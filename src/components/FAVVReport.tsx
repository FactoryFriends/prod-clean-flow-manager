import { FileText, Download, Calendar, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./ui/sheet";
import { Label } from "./ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";

interface FAVVTask {
  id: string;
  title: string;
  description: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  status: "open" | "closed";
  completed_at: string | null;
  completed_by: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  favv_compliance: boolean;
  assigned_staff_name: string | null;
}

interface FAVVReportProps {
  currentLocation: string;
}

export function FAVVReport({ currentLocation }: FAVVReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("today");
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  // Map location IDs to database values
  const getDbLocation = (locationId: string) => locationId === "location1" ? "tothai" : "khin";
  const getLocationName = (locationId: string) => locationId === "location1" ? "ToThai Production Facility" : "KHIN Restaurant";

  // Calculate date range based on period
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    
    switch (reportPeriod) {
      case "today":
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case "week":
        startDate.setDate(today.getDate() - 7);
        return { start: startDate.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        return { start: startDate.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      default:
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    }
  };

  const dateRange = getDateRange();
  const dbLocation = getDbLocation(selectedLocation);

  // Fetch FAVV compliance tasks
  const { data: favvTasks = [], isLoading } = useQuery({
    queryKey: ['favv-report', dbLocation, reportPeriod, dateRange],
    queryFn: async () => {
      console.log('Fetching FAVV report data for:', { dbLocation, dateRange });
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('location', dbLocation)
        .eq('favv_compliance', true)
        .gte('scheduled_date', dateRange.start)
        .lte('scheduled_date', dateRange.end)
        .order('scheduled_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching FAVV report data:', error);
        throw error;
      }

      console.log('Fetched FAVV report data:', data);
      return data as FAVVTask[];
    },
    enabled: isOpen, // Only fetch when sheet is open
  });

  const generateReport = () => {
    const locationName = getLocationName(selectedLocation);
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    const completedTasks = favvTasks.filter(task => task.status === 'closed');
    const pendingTasks = favvTasks.filter(task => task.status === 'open');
    const overdueTasks = favvTasks.filter(task => {
      if (task.status === 'closed') return false;
      const scheduledDate = new Date(task.scheduled_date);
      const now = new Date();
      const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
      return diffHours > 48;
    });
    
    const complianceRate = favvTasks.length > 0 ? 
      ((completedTasks.length / favvTasks.length) * 100).toFixed(1) : '0';

    let reportContent = `
FAVV COMPLIANCE REPORT
====================

Generated: ${reportDate} ${reportTime}
Location: ${locationName}
Period: ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}
Date Range: ${dateRange.start} to ${dateRange.end}

SUMMARY
-------
Total FAVV Tasks: ${favvTasks.length}
Completed: ${completedTasks.length}
Open: ${pendingTasks.length}
Overdue: ${overdueTasks.length}
Compliance Rate: ${complianceRate}%

DETAILED TASK LOG
================
`;

    favvTasks.forEach((task, index) => {
      reportContent += `
${index + 1}. ${task.title}
   Status: ${task.status.toUpperCase()}
   Scheduled: ${task.scheduled_date}
   ${task.completed_at ? `Completed: ${new Date(task.completed_at).toLocaleDateString()} ${new Date(task.completed_at).toLocaleTimeString()}` : ''}
   ${task.completed_by ? `Completed by: ${task.completed_by}` : ''}
   ${task.assigned_staff_name ? `Assigned to: ${task.assigned_staff_name}` : ''}
   Duration: ${task.estimated_duration ? `${task.estimated_duration} min (estimated)` : 'Not specified'}
   ${task.actual_duration ? `${task.actual_duration} min (actual)` : ''}
   Description: ${task.description || 'No description'}
   ---
`;
    });

    reportContent += `

NOTE: This report contains only FAVV compliance-related cleaning tasks.
Production and shipping data will be included in future versions.

Generated by ToThai Cleaning Management System
Report ID: FAVV-${Date.now()}
`;

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FAVV_Report_${locationName.replace(/\s+/g, '_')}_${dateRange.start}_to_${dateRange.end}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'text-green-600';
      case 'open': return 'text-orange-600';
      default: return 'text-orange-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          Generate FAVV Report
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            FAVV Compliance Report
          </SheetTitle>
          <SheetDescription>
            Generate official FAVV compliance logs for inspections. This report includes all FAVV-related cleaning tasks and compliance data.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Period</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location1">ToThai Production</SelectItem>
                  <SelectItem value="location2">KHIN Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Report Summary</h3>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {favvTasks.length} FAVV Tasks
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {favvTasks.filter(t => t.status === 'closed').length}
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {favvTasks.filter(t => t.status === 'open').length}
                  </div>
                  <div className="text-sm text-orange-700">Open</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {favvTasks.filter(task => {
                      if (task.status === 'closed') return false;
                      const scheduledDate = new Date(task.scheduled_date);
                      const now = new Date();
                      const diffHours = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
                      return diffHours > 48;
                    }).length}
                  </div>
                  <div className="text-sm text-red-700">Overdue</div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {favvTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No FAVV compliance tasks found for the selected period.</p>
                  </div>
                ) : (
                  favvTasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    return (
                      <div key={task.id} className="border border-border rounded-lg p-3 bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(task.status)}`} />
                            <span className={`text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Scheduled: {task.scheduled_date}</span>
                          </div>
                          {task.completed_at && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed: {new Date(task.completed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.estimated_duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>Duration: {formatDuration(task.estimated_duration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={generateReport}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  disabled={favvTasks.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Note:</p>
                <p>This FAVV compliance report currently includes cleaning task data. Production and shipping data will be integrated in future updates to provide a complete overview for official inspections.</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
