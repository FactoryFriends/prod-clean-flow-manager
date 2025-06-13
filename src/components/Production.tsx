
import { Package, Plus, Search, Filter } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface ProductionProps {
  currentLocation: string;
}

export function Production({ currentLocation }: ProductionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const productionItems = [
    {
      id: "SP-001",
      name: "Metal Components Type A",
      quantity: 150,
      targetQuantity: 200,
      status: "in-progress" as const,
      startDate: "2024-06-10",
      estimatedCompletion: "2024-06-15",
      location: "Line 1",
    },
    {
      id: "SP-002", 
      name: "Plastic Housing Units",
      quantity: 200,
      targetQuantity: 200,
      status: "completed" as const,
      startDate: "2024-06-08",
      estimatedCompletion: "2024-06-12",
      location: "Line 2",
    },
    {
      id: "SP-003",
      name: "Electronic Assemblies",
      quantity: 0,
      targetQuantity: 100,
      status: "pending" as const,
      startDate: "2024-06-14",
      estimatedCompletion: "2024-06-18",
      location: "Line 3",
    },
    {
      id: "SP-004",
      name: "Rubber Seals Package",
      quantity: 50,
      targetQuantity: 300,
      status: "overdue" as const,
      startDate: "2024-06-05",
      estimatedCompletion: "2024-06-12",
      location: "Line 1",
    },
  ];

  const filteredItems = productionItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Production Management</h1>
          <p className="text-muted-foreground">
            Track semi-product manufacturing at {currentLocation === "location1" ? "Main Production Facility" : "Secondary Distribution Center"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-fit">
          <Plus className="w-4 h-4" />
          New Production Run
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search production runs..."
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.id}</h3>
                  <p className="text-sm text-muted-foreground">{item.location}</p>
                </div>
              </div>
              <StatusBadge status={item.status} size="sm" />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">{item.name}</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {item.quantity}/{item.targetQuantity} units
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.quantity / item.targetQuantity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="text-foreground font-medium">{item.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Completion</p>
                  <p className="text-foreground font-medium">{item.estimatedCompletion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
