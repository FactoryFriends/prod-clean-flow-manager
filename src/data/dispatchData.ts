
import { ExternalProduct, StaffCode } from "@/types/dispatch";

export const externalProducts: ExternalProduct[] = [
  { id: "ext-1", name: "Coconut Milk", supplier: "Thai Suppliers Ltd" },
  { id: "ext-2", name: "Basmati Rice", supplier: "Rice Masters" },
  { id: "ext-3", name: "Green Curry Paste", supplier: "Spice World" },
];

export const staffCodes: StaffCode[] = [
  { code: "1234", name: "Jan Janssen", role: "Logistics Manager" },
  { code: "5678", name: "Marie Dubois", role: "Warehouse Staff" },
  { code: "9012", name: "Ahmed Hassan", role: "Kitchen Manager" },
  { code: "3456", name: "Lisa Chen", role: "Warehouse Staff" },
];
