
import { Truck, Plus, Search, Filter, MapPin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface DistributionProps {
  currentLocation: string;
}

export function Distribution({ currentLocation }: DistributionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const shipments = [
    {
      id: "SH-001",
      customer: "ABC Manufacturing Co.",
      destination: "Chicago, IL",
      products: ["SP-001 (50 units)", "SP-002 (30 units)"],
      status: "shipped" as const,
      shipDate: "2024-06-12",
      estimatedDelivery: "2024-06-14",
      trackingNumber: "TRK123456789",
    },
    {
      id: "SH-002",
      customer: "XYZ Industries",
      destination: "Houston, TX", 
      products: ["SP-002 (100 units)"],
      status: "delivered" as const,
      shipDate: "2024-06-10",
      estimatedDelivery: "2024-06-12",
      trackingNumber: "TRK987654321",
    },
    {
      id: "SH-003",
      customer: "Tech Solutions Ltd.",
      destination: "Seattle, WA",
      products: ["SP-001 (25 units)", "SP-003 (15 units)"],
      status: "pending" as const,
      shipDate: "2024-06-15",
      estimatedDelivery: "2024-06-17",
      trackingNumber: "-",
    },
    {
      id: "SH-004",
      customer: "Global Corp",
      destination: "New York, NY",
      products: ["SP-004 (200 units)"],
      status: "overdue" as const,
      shipDate: "2024-06-08",
      estimatedDelivery: "2024-06-11",
      trackingNumber: "TRK456789123",
    },
  ];

  const filteredShipments = shipments.filter(shipment =>
    shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Distribution Management</h1>
          <p className="text-muted-foreground">
            Track shipments and deliveries from {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-fit">
          <Plus className="w-4 h-4" />
          New Shipment
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search shipments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShipments.map((shipment) => (
          <div key={shipment.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{shipment.id}</h3>
                  <p className="text-sm text-muted-foreground">{shipment.customer}</p>
                </div>
              </div>
              <StatusBadge status={shipment.status} size="sm" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{shipment.destination}</span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Products</h4>
                <div className="space-y-1">
                  {shipment.products.map((product, index) => (
                    <div key={index} className="text-sm text-muted-foreground bg-accent px-3 py-1 rounded">
                      {product}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ship Date</p>
                  <p className="text-foreground font-medium">{shipment.shipDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Delivery</p>
                  <p className="text-foreground font-medium">{shipment.estimatedDelivery}</p>
                </div>
              </div>

              {shipment.trackingNumber !== "-" && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="text-sm font-medium text-primary">{shipment.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
