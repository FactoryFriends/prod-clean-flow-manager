
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { CheckSquare } from "lucide-react";
import { format } from "date-fns";

interface CompletedTask {
  id: string;
  title: string;
  location: "tothai" | "khin" | "both";
  scheduled_date: string;
  completed_at: string | null;
  completed_by: string | null;
  staff_codes?: {
    initials: string;
  } | null;
}

interface CompletedTasksTableProps {
  completedTasks: CompletedTask[];
  isLoading: boolean;
  onTaskClick: (task: CompletedTask) => void;
}

export function CompletedTasksTable({ completedTasks, isLoading, onTaskClick }: CompletedTasksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Completed Cleaning Tasks ({completedTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            Loading completed cleaning tasks...
          </div>
        ) : !completedTasks.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed cleaning tasks found for the selected criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Completed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.location?.toUpperCase() || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(task.scheduled_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {task.completed_at 
                        ? format(new Date(task.completed_at), "MMM dd, yyyy HH:mm")
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell>{task.staff_codes?.initials || task.completed_by || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
