
import { format } from "date-fns";

interface SelectedItem {
  id: string;
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
}

interface PackingSlipItemsTableProps {
  selectedItems: SelectedItem[];
}

export function PackingSlipItemsTable({ selectedItems }: PackingSlipItemsTableProps) {
  return (
    <div className="mb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left font-semibold">Product</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Batch Number</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Production Date</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-3">{item.name}</td>
              <td className="border border-gray-300 p-3 font-mono text-sm">
                {item.batchNumber || "-"}
              </td>
              <td className="border border-gray-300 p-3">
                {item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : "-"}
              </td>
              <td className="border border-gray-300 p-3">{item.selectedQuantity} bags</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
