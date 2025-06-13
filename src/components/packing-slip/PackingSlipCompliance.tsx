
import { Check } from "lucide-react";

export function PackingSlipCompliance() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">FAVV Compliance:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>Full batch traceability</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>Production dates recorded</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>Transport documentation</span>
        </div>
      </div>
    </div>
  );
}
