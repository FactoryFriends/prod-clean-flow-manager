import { Edit, Trash2, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { useDeleteStaffCode } from "@/hooks/useStaffCodeMutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface StaffCode {
  code: string;
  name: string;
  role?: string;
  location?: "tothai" | "khin" | "both";
  active?: boolean;
  department?: string;
  permission_level?: string | null; // Allow string or null to match database
}

interface StaffCodeListProps {
  onEditStaffCode: (staffCode: StaffCode) => void;
}

export function StaffCodeList({ onEditStaffCode }: StaffCodeListProps) {
  const { data: staffCodes = [], isLoading } = useStaffCodes();
  const deleteStaffCode = useDeleteStaffCode();

  const handleDelete = (code: string) => {
    deleteStaffCode.mutate(code);
  };

  const getLocationLabel = (location?: string) => {
    switch (location) {
      case "tothai":
        return "ToThai";
      case "khin":
        return "KHIN";
      case "both":
        return "Both";
      default:
        return "Unknown";
    }
  };

  const getPermissionBadgeVariant = (level?: string | null) => {
    switch (level) {
      case "manager":
        return "destructive" as const;
      case "supervisor":
        return "default" as const;
      case "basic":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getPermissionLabel = (level?: string | null) => {
    switch (level) {
      case "manager":
        return "Manager";
      case "supervisor":
        return "Supervisor";
      case "basic":
        return "Basic";
      default:
        return "Not Set";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading staff codes...
      </div>
    );
  }

  if (staffCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No staff codes found. Create your first staff code to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staffCodes.map((staffCode) => (
        <Card key={staffCode.code}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{staffCode.name}</h3>
                  <Badge variant="outline" className="font-mono">
                    {staffCode.code}
                  </Badge>
                  <Badge variant={staffCode.active ? "default" : "secondary"}>
                    {staffCode.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge 
                    variant={getPermissionBadgeVariant(staffCode.permission_level)}
                    className="flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {getPermissionLabel(staffCode.permission_level)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {staffCode.role && (
                    <span>Role: {staffCode.role}</span>
                  )}
                  {staffCode.department && (
                    <span>Department: {staffCode.department}</span>
                  )}
                  <span>Location: {getLocationLabel(staffCode.location)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditStaffCode(staffCode)}
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Staff Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the staff code for "{staffCode.name}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(staffCode.code)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
