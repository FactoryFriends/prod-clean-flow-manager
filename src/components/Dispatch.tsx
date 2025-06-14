
import { DispatchManager } from "./dispatch/DispatchManager";

interface DispatchProps {
  currentLocation: "tothai" | "khin";
  dispatchType: "external" | "internal";
}

export function Dispatch({ currentLocation, dispatchType }: DispatchProps) {
  return <DispatchManager currentLocation={currentLocation} dispatchType={dispatchType} />;
}
