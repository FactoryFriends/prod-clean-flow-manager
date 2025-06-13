
import jsPDF from 'jspdf';
import { format } from "date-fns";

interface PDFItem {
  id: string;
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
}

interface PDFData {
  packingSlipNumber: string;
  currentDate: string;
  destinationCustomer: {
    name: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  } | null;
  selectedItems: PDFItem[];
  totalItems: number;
  totalPackages: number;
  preparedBy: string;
  pickedUpBy: string;
}

export const generatePackingSlipPDF = (data: PDFData) => {
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont('helvetica');
  
  // Header - Company Info (left side)
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTHAI', 20, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Production Kitchen', 20, 35);
  pdf.text('Leuvensestraat 100', 20, 42);
  pdf.text('3300 Tienen', 20, 49);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BE0534 968 163', 20, 56);
  
  // Packing Slip Title and Number (right side)
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACKING SLIP', 140, 25);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`#${data.packingSlipNumber}`, 140, 35);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.currentDate, 140, 42);
  
  // Destination section with background
  let yPos = 75;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Destination:', 20, yPos);
  
  // Background box for destination
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.rect(20, yPos + 5, 170, data.destinationCustomer ? 35 : 20, 'F');
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.destinationCustomer ? data.destinationCustomer.name : "External Customer", 25, yPos);
  
  if (data.destinationCustomer && data.destinationCustomer.address) {
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(data.destinationCustomer.address, 25, yPos);
  }
  
  if (data.destinationCustomer && data.destinationCustomer.contact_person) {
    yPos += 7;
    pdf.text(`Contact: ${data.destinationCustomer.contact_person}`, 25, yPos);
  }
  
  if (data.destinationCustomer && data.destinationCustomer.phone) {
    yPos += 7;
    pdf.text(`Phone: ${data.destinationCustomer.phone}`, 25, yPos);
  }
  
  yPos += 7;
  pdf.text(`Date: ${data.currentDate}`, 25, yPos);
  
  // Items Table with proper borders
  yPos += 25;
  
  // Table header background
  pdf.setFillColor(243, 244, 246); // Gray background for header
  pdf.rect(20, yPos - 8, 170, 12, 'F');
  
  // Table borders
  pdf.setDrawColor(209, 213, 219); // Gray border color
  pdf.rect(20, yPos - 8, 170, 12); // Header border
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Product', 25, yPos - 2);
  pdf.text('Batch Number', 75, yPos - 2);
  pdf.text('Production Date', 125, yPos - 2);
  pdf.text('Quantity', 165, yPos - 2);
  
  // Vertical lines for table columns
  pdf.line(70, yPos - 8, 70, yPos + 4);
  pdf.line(120, yPos - 8, 120, yPos + 4);
  pdf.line(160, yPos - 8, 160, yPos + 4);
  
  yPos += 4;
  
  // Table rows
  pdf.setFont('helvetica', 'normal');
  data.selectedItems.forEach((item, index) => {
    const rowHeight = 10;
    
    // Alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPos, 170, rowHeight, 'F');
    }
    
    // Row border
    pdf.rect(20, yPos, 170, rowHeight);
    
    // Vertical lines
    pdf.line(70, yPos, 70, yPos + rowHeight);
    pdf.line(120, yPos, 120, yPos + rowHeight);
    pdf.line(160, yPos, 160, yPos + rowHeight);
    
    // Row content
    pdf.text(item.name, 25, yPos + 6);
    pdf.text(item.batchNumber || "-", 75, yPos + 6);
    pdf.text(item.productionDate ? format(new Date(item.productionDate), "yyyy-MM-dd") : "-", 125, yPos + 6);
    pdf.text(`${item.selectedQuantity} bags`, 165, yPos + 6);
    
    yPos += rowHeight;
  });
  
  // Summary section
  yPos += 15;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary:', 20, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Items: ${data.totalItems}`, 20, yPos);
  yPos += 7;
  pdf.text(`Total Packages: ${data.totalPackages}`, 20, yPos);
  
  // FAVV Compliance section
  yPos += 20;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FAVV Compliance:', 20, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('✓ Full batch traceability', 25, yPos);
  yPos += 7;
  pdf.text('✓ Production dates recorded', 25, yPos);
  yPos += 7;
  pdf.text('✓ Transport documentation', 25, yPos);
  
  // Signatures section with background boxes
  yPos += 25;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Prepared by:', 20, yPos);
  pdf.text('Picked up by:', 110, yPos);
  
  // Background boxes for signatures
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, yPos + 5, 80, 25, 'F');
  pdf.rect(110, yPos + 5, 80, 25, 'F');
  
  // Signature borders
  pdf.setDrawColor(229, 231, 235);
  pdf.rect(20, yPos + 5, 80, 25);
  pdf.rect(110, yPos + 5, 80, 25);
  
  yPos += 15;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.preparedBy || "Not specified", 25, yPos);
  pdf.text(data.pickedUpBy || "Not specified", 115, yPos);
  
  yPos += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Electronisch ondertekend door ${data.preparedBy || "Not specified"}`, 25, yPos);
  pdf.text(`Electronisch ondertekend door ${data.pickedUpBy || "Not specified"}`, 115, yPos);
  
  yPos += 5;
  pdf.text(`Date: ${data.currentDate}`, 25, yPos);
  pdf.text(`Date: ${data.currentDate}`, 115, yPos);
  
  const currentTime = format(new Date(), "HH:mm");
  yPos += 5;
  pdf.text(`Time: ${currentTime}`, 25, yPos);
  pdf.text(`Time: ${currentTime}`, 115, yPos);
  
  // Footer
  yPos += 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This document serves as official transport documentation for FAVV compliance', 20, yPos);
  yPos += 4;
  pdf.text('Generated by TOTHAI Operations Management System', 20, yPos);
  
  // Save the PDF
  pdf.save(`packing-slip-${data.packingSlipNumber}.pdf`);
};
