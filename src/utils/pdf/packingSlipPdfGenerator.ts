
import jsPDF from 'jspdf';
import { PDFData } from './types';
import { addCompanyHeader, addPackingSlipTitle } from './headerUtils';
import { addDestinationSection } from './destinationUtils';
import { addItemsTable } from './tableUtils';
import { addSummarySection, addComplianceSection, addSignatureSection, addFooter } from './summaryUtils';

export const generatePackingSlipPDF = (data: PDFData) => {
  const pdf = new jsPDF();
  
  // Add header sections
  addCompanyHeader(pdf);
  addPackingSlipTitle(pdf, data.packingSlipNumber, data.currentDate);
  
  // Add destination section
  const destinationEndY = addDestinationSection(pdf, data.destinationCustomer, data.currentDate);
  
  // Add items table
  const tableEndY = addItemsTable(pdf, data.selectedItems, destinationEndY);
  
  // Add summary section
  const summaryEndY = addSummarySection(pdf, data.totalItems, data.totalPackages, tableEndY);
  
  // Add compliance section
  const complianceEndY = addComplianceSection(pdf, summaryEndY);
  
  // Add signature section
  const signatureEndY = addSignatureSection(pdf, data.preparedBy, data.pickedUpBy, data.currentDate, complianceEndY);
  
  // Add footer
  addFooter(pdf, signatureEndY);
  
  // Save the PDF
  pdf.save(`packing-slip-${data.packingSlipNumber}.pdf`);
};
