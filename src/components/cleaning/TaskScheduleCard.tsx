
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LocationSelector } from "./LocationSelector";

interface TaskScheduleCardProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

export function TaskScheduleCard({ 
  selectedDate, 
  onDateChange, 
  selectedLocation, 
  onLocationChange 
}: TaskScheduleCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Task Schedule</h2>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <LocationSelector 
            selectedLocation={selectedLocation}
            onLocationChange={onLocationChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
