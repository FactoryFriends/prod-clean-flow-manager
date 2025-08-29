import { PDFData } from './types';

export const printPackingSlipA4 = (data: PDFData) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the packing slip');
    return;
  }

  // Generate HTML content for A4 printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Packing Slip ${data.packingSlipNumber}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          color: #000;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .company-info p {
          margin: 2px 0;
          font-size: 11px;
        }
        
        .slip-info {
          text-align: right;
        }
        
        .slip-info h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .slip-info p {
          margin: 2px 0;
          font-size: 11px;
        }
        
        .destination {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .destination h3 {
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }
        
        .destination p {
          margin: 2px 0;
          font-size: 11px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: left;
          font-size: 10px;
        }
        
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .summary {
          margin-bottom: 20px;
        }
        
        .summary h3 {
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .compliance {
          margin-bottom: 20px;
        }
        
        .compliance p {
          font-size: 12px;
          font-weight: bold;
        }
        
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .signature-box {
          border: 1px solid #ccc;
          padding: 10px;
          background-color: #f9f9f9;
        }
        
        .signature-box h4 {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }
        
        .signature-box p {
          margin: 2px 0;
          font-size: 10px;
        }
        
        .footer {
          text-align: center;
          font-size: 9px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        
        .footer p {
          margin: 2px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div>
            <p><strong>ToThai BV</strong></p>
            <p>Production Kitchen</p>
            <p>Leuvensestraat 100</p>
            <p>3300 Tienen</p>
            <p><strong>Registration 0534 968 163</strong></p>
          </div>
        </div>
        <div class="slip-info">
          <h2>PACKING SLIP</h2>
          <p><strong>#${data.packingSlipNumber}</strong></p>
          <p>${data.currentDate}</p>
        </div>
      </div>
      
      <div class="destination">
        <h3>Destination:</h3>
        <p><strong>${data.destinationCustomer ? `${data.destinationCustomer.name}${data.destinationCustomer.address ? ` - ${data.destinationCustomer.address}` : ''}` : 'External Customer'}</strong></p>
        ${data.destinationCustomer?.contact_person ? `<p>Contact: ${data.destinationCustomer.contact_person}</p>` : ''}
        ${data.destinationCustomer?.phone ? `<p>Phone: ${data.destinationCustomer.phone}</p>` : ''}
        <p>Date: ${data.currentDate}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Batch Number</th>
            <th>Production Date</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${data.selectedItems.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.batchNumber || '-'}</td>
              <td>${item.productionDate || '-'}</td>
              <td>${item.selectedQuantity} bags</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <h3>Summary:</h3>
        <p>Total Items: ${data.totalItems} | Total Packages: ${data.totalPackages}</p>
      </div>
      
      <div class="compliance">
        <p>FAVV Compliance: ok</p>
      </div>
      
      <div class="signatures">
        <div class="signature-box">
          <h4>Prepared by:</h4>
          <p><strong>${data.preparedBy || 'Not specified'}</strong></p>
          <p>Electronisch ondertekend door ${data.preparedBy || 'Not specified'}</p>
          <p>Date: ${data.currentDate}</p>
          <p>Time: ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div class="signature-box">
          <h4>Picked up by:</h4>
          <p><strong>${data.pickedUpBy || 'Not specified'}</strong></p>
          <p>Electronisch ondertekend door ${data.pickedUpBy || 'Not specified'}</p>
          <p>Date: ${data.currentDate}</p>
          <p>Time: ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This document serves as official transport documentation for FAVV compliance</p>
        <p>Generated by TOTHAI Operations Management System</p>
      </div>
    </body>
    </html>
  `;

  // Write content to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};