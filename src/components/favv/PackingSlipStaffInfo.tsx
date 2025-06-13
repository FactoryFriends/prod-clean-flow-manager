
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User } from "lucide-react";

interface PackingSlipStaffInfoProps {
  preparedBy?: string;
  pickedUpBy?: string;
  pickerName?: string;
}

export function PackingSlipStaffInfo({ preparedBy, pickedUpBy, pickerName }: PackingSlipStaffInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Staff Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {preparedBy && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prepared by</p>
                <p className="text-sm text-muted-foreground">{preparedBy}</p>
              </div>
            </div>
          )}
          
          {(pickedUpBy || pickerName) && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Picked up by</p>
                <p className="text-sm text-muted-foreground">
                  {pickerName || pickedUpBy}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
