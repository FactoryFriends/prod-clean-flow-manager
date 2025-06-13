
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
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Destination:</h3>
      <div className="bg-gray-50 p-4 rounded">
        <p className="font-semibold">{destinationCustomer ? destinationCustomer.name : "External Customer"}</p>
        {destinationCustomer && destinationCustomer.address && (
          <p className="text-sm text-gray-600 mt-1">{destinationCustomer.address}</p>
        )}
        {destinationCustomer && destinationCustomer.contact_person && (
          <p className="text-sm text-gray-600">Contact: {destinationCustomer.contact_person}</p>
        )}
        {destinationCustomer && destinationCustomer.phone && (
          <p className="text-sm text-gray-600">Phone: {destinationCustomer.phone}</p>
        )}
        <p className="text-sm text-gray-600 mt-2">Date: {currentDate}</p>
      </div>
    </div>
  );
}
