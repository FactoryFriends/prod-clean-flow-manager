
import jsPDF from 'jspdf';

interface DestinationCustomer {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
}

export const addDestinationSection = (pdf: jsPDF, destinationCustomer: DestinationCustomer | null, currentDate: string): number => {
  let yPos = 75;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Destination:', 20, yPos);
  
  // Background box for destination
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.rect(20, yPos + 5, 170, destinationCustomer ? 35 : 20, 'F');
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(destinationCustomer ? destinationCustomer.name : "External Customer", 25, yPos);
  
  if (destinationCustomer && destinationCustomer.address) {
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(destinationCustomer.address, 25, yPos);
  }
  
  if (destinationCustomer && destinationCustomer.contact_person) {
    yPos += 7;
    pdf.text(`Contact: ${destinationCustomer.contact_person}`, 25, yPos);
  }
  
  if (destinationCustomer && destinationCustomer.phone) {
    yPos += 7;
    pdf.text(`Phone: ${destinationCustomer.phone}`, 25, yPos);
  }
  
  yPos += 7;
  pdf.text(`Date: ${currentDate}`, 25, yPos);
  
  return yPos;
};
