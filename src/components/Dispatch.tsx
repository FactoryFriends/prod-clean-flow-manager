
import { DispatchManager } from "./dispatch/DispatchManager";

interface DispatchProps {
  currentLocation: "tothai" | "khin";
}

export function Dispatch({ currentLocation }: DispatchProps) {
  return <DispatchManager currentLocation={currentLocation} />;
}
