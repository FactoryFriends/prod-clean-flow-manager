
import { format } from "date-fns";

interface PackingSlipSignaturesProps {
  preparedBy: string;
  pickedUpBy: string;
  currentDate: string;
}

export function PackingSlipSignatures({ preparedBy, pickedUpBy, currentDate }: PackingSlipSignaturesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Prepared by:</h3>
        <div className="bg-gray-50 p-2 rounded border text-xs">
          <p className="font-semibold">{preparedBy || "Not specified"}</p>
          <p className="text-gray-600 mt-0.5">
            Electronisch ondertekend door {preparedBy || "Not specified"}
          </p>
          <p className="text-gray-600">Date: {currentDate}</p>
          <p className="text-gray-600">Time: {format(new Date(), "HH:mm")}</p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Picked up by:</h3>
        <div className="bg-gray-50 p-2 rounded border text-xs">
          <p className="font-semibold">{pickedUpBy || "Not specified"}</p>
          <p className="text-gray-600 mt-0.5">
            Electronisch ondertekend door {pickedUpBy || "Not specified"}
          </p>
          <p className="text-gray-600">Date: {currentDate}</p>
          <p className="text-gray-600">Time: {format(new Date(), "HH:mm")}</p>
        </div>
      </div>
    </div>
  );
}
