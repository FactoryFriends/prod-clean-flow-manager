
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FileText } from "lucide-react";
import { PackingSlipHeader } from "./PackingSlipHeader";
import { PackingSlipDispatchInfo } from "./PackingSlipDispatchInfo";
import { PackingSlipStaffInfo } from "./PackingSlipStaffInfo";
import { PackingSlipBatchInfo } from "./PackingSlipBatchInfo";
import { PackingSlipPickupInfo } from "./PackingSlipPickupInfo";

interface PackingSlip {
  id: string;
  slip_number: string;
  created_at: string;
  destination: string;
  total_items: number;
  total_packages: number;
  prepared_by?: string;
  picked_up_by?: string;
  pickup_date?: string;
  batch_ids?: string[];
  status?: string;
  dispatch_records?: {
    location?: string;
    dispatch_type?: string;
    picker_name?: string;
    customer?: string;
    dispatch_notes?: string;
  } | null;
  batches?: {
    id: string;
    batch_number: string;
    production_date: string;
    expiry_date: string;
    products: {
      name: string;
      unit_size: number;
      unit_type: string;
    };
  }[];
}

interface PackingSlipDetailsModalProps {
  packingSlip: PackingSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PackingSlipDetailsModal({ packingSlip, isOpen, onClose }: PackingSlipDetailsModalProps) {
  if (!packingSlip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Packing Slip Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <PackingSlipHeader packingSlip={packingSlip} />
          
          <PackingSlipDispatchInfo dispatchRecords={packingSlip.dispatch_records} />
          
          <PackingSlipStaffInfo 
            preparedBy={packingSlip.prepared_by}
            pickedUpBy={packingSlip.picked_up_by}
            pickerName={packingSlip.dispatch_records?.picker_name}
          />
          
          <PackingSlipBatchInfo 
            batches={packingSlip.batches}
            batchIds={packingSlip.batch_ids}
          />
          
          <PackingSlipPickupInfo pickupDate={packingSlip.pickup_date} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
