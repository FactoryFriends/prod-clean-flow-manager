
import jsPDF from 'jspdf';
import { format } from "date-fns";
import { PDFItem } from './types';

export const addItemsTable = (pdf: jsPDF, selectedItems: PDFItem[], startY: number): number => {
  let yPos = startY + 25;
  
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
  selectedItems.forEach((item, index) => {
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
  
  return yPos;
};
