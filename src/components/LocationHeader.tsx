
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LocationHeaderProps {
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

export function LocationHeader({ currentLocation, onLocationChange }: LocationHeaderProps) {
  const isMobile = useIsMobile();

  const locationConfig = {
    tothai: { bg: "bg-tothai-primary", text: "text-tothai-accent", name: "ToThai Restaurant" },
    khin: { bg: "bg-khin-primary", text: "text-khin-accent", name: "KHIN Restaurant" }
  };

  const { bg, text, name } = locationConfig[currentLocation];
  const displayName = isMobile ? (currentLocation === "tothai" ? "ToThai" : "KHIN") : name;

  return (
    <div className="flex items-center border-b bg-background px-4 py-2">
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="w-4 h-4" />
              <span>{displayName}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onLocationChange("tothai")}
              className={cn(
                "flex items-center gap-2",
                currentLocation === "tothai" && "bg-tothai-primary/10"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-tothai-primary"></div>
              ToThai Restaurant
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onLocationChange("khin")}
              className={cn(
                "flex items-center gap-2",
                currentLocation === "khin" && "bg-khin-primary/10"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-khin-primary"></div>
              KHIN Restaurant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
