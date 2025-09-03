
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { FileText, Printer } from "lucide-react";
import { printPackingSlipA4 } from "@/utils/pdf/packingSlipPrintA4";
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
  item_details?: any[];
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

  const handlePrint = () => {
    // Use stored item_details if available, otherwise fallback to batch data
    const selectedItems = packingSlip.item_details && Array.isArray(packingSlip.item_details) && packingSlip.item_details.length > 0
      ? packingSlip.item_details
      : packingSlip.batches?.map(batch => ({
          id: batch.id,
          name: batch.products.name,
          batchNumber: batch.batch_number,
          selectedQuantity: 1, // Fallback for old records
          productionDate: batch.production_date,
          type: 'batch' as const
        })) || [];

    printPackingSlipA4({
      packingSlipNumber: packingSlip.slip_number,
      currentDate: packingSlip.pickup_date || packingSlip.created_at.split('T')[0],
      destinationCustomer: {
        name: packingSlip.destination
      },
      selectedItems,
      totalItems: packingSlip.total_items,
      totalPackages: packingSlip.total_packages,
      preparedBy: packingSlip.prepared_by || 'Not specified',
      pickedUpBy: packingSlip.picked_up_by || 'Not specified',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Packing Slip Details
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print A4
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-white p-6 font-sans text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="flex justify-between mb-5 border-b-2 border-gray-800 pb-3">
            <div>
              <p><strong>ToThai BV</strong></p>
              <p>Production Kitchen</p>
              <p>Leuvensestraat 100</p>
              <p>3300 Tienen</p>
              <p><strong>Registration 0534 968 163</strong></p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold mb-1">PACKING SLIP</h2>
              <p><strong>#{packingSlip.slip_number}</strong></p>
              <p>{packingSlip.pickup_date || packingSlip.created_at.split('T')[0]}</p>
            </div>
          </div>
          
          {/* Destination */}
          <div className="bg-gray-100 p-3 rounded mb-5">
            <h3 className="text-sm font-bold mb-2">Destination:</h3>
            <p><strong>{packingSlip.destination}</strong></p>
            <p>Date: {packingSlip.pickup_date || packingSlip.created_at.split('T')[0]}</p>
          </div>
          
          {/* Items Table */}
          <table className="w-full border-collapse mb-5">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100 text-left text-xs font-bold">Product</th>
                <th className="border border-gray-300 p-2 bg-gray-100 text-left text-xs font-bold">Batch Number</th>
                <th className="border border-gray-300 p-2 bg-gray-100 text-left text-xs font-bold">Production Date</th>
                <th className="border border-gray-300 p-2 bg-gray-100 text-left text-xs font-bold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(packingSlip.item_details && Array.isArray(packingSlip.item_details) && packingSlip.item_details.length > 0
                ? packingSlip.item_details
                : packingSlip.batches?.map(batch => ({
                    name: batch.products.name,
                    batchNumber: batch.batch_number,
                    selectedQuantity: 1,
                    productionDate: batch.production_date,
                  })) || []
              ).map((item, index) => {
                // Check if this is an external product
                const isExternalProduct = item.type !== 'batch' || 
                  (item.product_type && item.product_type !== 'zelfgemaakt') ||
                  (item.product_kind && item.product_kind !== 'zelfgemaakt');
                
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 text-xs">{item.name}</td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {isExternalProduct ? "EXTERNAL PRODUCT" : (item.batchNumber || '-')}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {isExternalProduct ? "SEE PACKAGING" : (item.productionDate || '-')}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">{item.selectedQuantity} {item.unitType || item.innerUnitType || 'units'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Summary */}
          <div className="mb-5">
            <h3 className="text-sm font-bold mb-1">Summary:</h3>
            <p>Total Items: {packingSlip.total_items} | Total Packages: {packingSlip.total_packages}</p>
          </div>
          
          {/* Compliance */}
          <div className="mb-5">
            <p className="text-sm font-bold">FAVV Compliance: ok</p>
          </div>
          
          {/* Signatures */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="border border-gray-300 p-3 bg-gray-50">
              <h4 className="text-sm font-bold mb-2">Prepared by:</h4>
              <p><strong>{packingSlip.prepared_by || 'Not specified'}</strong></p>
              <p>Electronically signed by {packingSlip.prepared_by || 'Not specified'}</p>
              <p>Date: {packingSlip.pickup_date || packingSlip.created_at.split('T')[0]}</p>
              <p>Time: {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="border border-gray-300 p-3 bg-gray-50">
              <h4 className="text-sm font-bold mb-2">Picked up by:</h4>
              <p><strong>{packingSlip.picked_up_by || 'Not specified'}</strong></p>
              <p>Electronically signed by {packingSlip.picked_up_by || 'Not specified'}</p>
              <p>Date: {packingSlip.pickup_date || packingSlip.created_at.split('T')[0]}</p>
              <p>Time: {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-3">
            <p>This document serves as official transport documentation for FAVV compliance</p>
            <p>Generated by TOTHAI Operations Management System</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
