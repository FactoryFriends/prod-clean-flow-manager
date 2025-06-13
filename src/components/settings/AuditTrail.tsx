
import { useState } from "react";
import { Calendar, Filter, FileText, AlertTriangle, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { format } from "date-fns";

export function AuditTrail() {
  const [favvOnly, setFavvOnly] = useState(false);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const { data: auditLogs = [], isLoading } = useAuditLogs(favvOnly);

  const filteredLogs = auditLogs.filter(log => {
    if (actionTypeFilter === "all") return true;
    return log.action_type === actionTypeFilter;
  });

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "production":
        return <FileText className="w-4 h-4" />;
      case "cleaning":
        return <AlertTriangle className="w-4 h-4" />;
      case "dispatch":
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionTypeBadge = (actionType: string) => {
    switch (actionType) {
      case "production":
        return "default";
      case "cleaning":
        return "secondary";
      case "dispatch":
        return "outline";
      default:
        return "outline";
    }
  };

  const uniqueActionTypes = [...new Set(auditLogs.map(log => log.action_type))];

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading audit trail...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          Audit Trail
        </CardTitle>
        <CardDescription>
          Complete audit trail of system activities for compliance and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="favv-only"
                checked={favvOnly}
                onCheckedChange={setFavvOnly}
              />
              <Label htmlFor="favv-only" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                FAVV Relevant Only
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Badge variant="outline" className="text-sm">
            {filteredLogs.length} records
          </Badge>
        </div>

        {/* Audit Log Entries */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found with current filters.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getActionTypeIcon(log.action_type)}
                      <Badge variant={getActionTypeBadge(log.action_type) as any}>
                        {log.action_type}
                      </Badge>
                    </div>
                    {log.favv_relevant && (
                      <Badge variant="destructive" className="text-xs">
                        FAVV
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </span>
                </div>

                <p className="text-sm mb-3">{log.action_description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {log.staff_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{log.staff_name} ({log.staff_code})</span>
                    </div>
                  )}
                  {log.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{log.location.toUpperCase()}</span>
                    </div>
                  )}
                  {log.reference_type && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{log.reference_type}: {log.reference_id?.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="mt-3">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Additional Details
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
