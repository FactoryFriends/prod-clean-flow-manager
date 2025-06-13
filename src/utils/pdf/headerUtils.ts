
import jsPDF from 'jspdf';

export const addCompanyHeader = (pdf: jsPDF) => {
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
};

export const addPackingSlipTitle = (pdf: jsPDF, packingSlipNumber: string, currentDate: string) => {
  // Packing Slip Title and Number (right side)
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACKING SLIP', 140, 25);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`#${packingSlipNumber}`, 140, 35);
  pdf.setFont('helvetica', 'normal');
  pdf.text(currentDate, 140, 42);
};
