
interface Customer {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
}

interface PackingSlipDestinationProps {
  destinationCustomer: Customer | null;
  currentDate: string;
}

export function PackingSlipDestination({ destinationCustomer, currentDate }: PackingSlipDestinationProps) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-1">Destination:</h3>
      <div className="bg-gray-50 p-2 rounded text-xs">
        <p className="font-semibold">
          {destinationCustomer ? `${destinationCustomer.name}${destinationCustomer.address ? ` - ${destinationCustomer.address}` : ''}` : "External Customer"}
        </p>
        {destinationCustomer && destinationCustomer.contact_person && (
          <p className="text-gray-600">Contact: {destinationCustomer.contact_person}</p>
        )}
        {destinationCustomer && destinationCustomer.phone && (
          <p className="text-gray-600">Phone: {destinationCustomer.phone}</p>
        )}
        <p className="text-gray-600 mt-1">Date: {currentDate}</p>
      </div>
    </div>
  );
}
