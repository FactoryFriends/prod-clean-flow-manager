
import { format } from "date-fns";

interface SelectedItem {
  id: string;
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
  unitType?: string;
}

interface PackingSlipItemsTableProps {
  selectedItems: SelectedItem[];
}

export function PackingSlipItemsTable({ selectedItems }: PackingSlipItemsTableProps) {
  return (
    <div className="mb-8">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left font-semibold text-xs">Product</th>
            <th className="border border-gray-300 p-2 text-left font-semibold text-xs">Batch Number</th>
            <th className="border border-gray-300 p-2 text-left font-semibold text-xs">Production Date</th>
            <th className="border border-gray-300 p-2 text-left font-semibold text-xs">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2 text-xs">{item.name}</td>
              <td className="border border-gray-300 p-2 font-mono text-xs">
                {item.batchNumber || "-"}
              </td>
              <td className="border border-gray-300 p-2 text-xs">
                {item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-xs">{item.selectedQuantity} {item.unitType || 'units'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
