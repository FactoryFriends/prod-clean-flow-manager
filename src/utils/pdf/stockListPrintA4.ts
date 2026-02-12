interface BatchItem {
  id: string;
  batch_number: string;
  products: {
    name: string;
  };
  production_date: string;
  expiry_date?: string;
  packages_in_stock: number;
  chefs: {
    name: string;
  };
}

interface StockListData {
  batches: BatchItem[];
  currentLocation: "tothai" | "khin";
  searchFilter?: string;
}

export const printStockListA4 = (data: StockListData) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the stock list');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  
  // Generate HTML content for A4 printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stock Verification List - ${currentDate}</title>
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
          font-size: 11px;
          line-height: 1.3;
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
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .company-info p {
          margin: 1px 0;
          font-size: 10px;
        }
        
        .report-info {
          text-align: right;
        }
        
        .report-info h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .report-info p {
          margin: 1px 0;
          font-size: 10px;
        }
        
        .filter-info {
          background-color: #f5f5f5;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .filter-info h3 {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .filter-info p {
          margin: 1px 0;
          font-size: 10px;
        }
        
        .stock-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .stock-table th,
        .stock-table td {
          border: 1px solid #333;
          padding: 4px;
          text-align: left;
          font-size: 9px;
        }
        
        .stock-table th {
          background-color: #e5e5e5;
          font-weight: bold;
          text-align: center;
        }
        
        .stock-table .physical-count,
        .stock-table .notes {
          width: 80px;
          min-height: 20px;
          background-color: #f9f9f9;
        }
        
        .instructions {
          margin-bottom: 15px;
          padding: 8px;
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
        }
        
        .instructions h3 {
          font-size: 11px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .instructions p {
          margin: 2px 0;
          font-size: 9px;
        }
        
        .signatures {
          margin-top: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .signature-box {
          border: 1px solid #333;
          padding: 10px;
          background-color: #f9f9f9;
          min-height: 60px;
        }
        
        .signature-box h4 {
          font-size: 10px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          margin-top: 30px;
          padding-bottom: 2px;
        }
        
        .footer {
          text-align: center;
          font-size: 8px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>TOTHAI BV</h1>
          <p>Production Kitchen</p>
          <p>Leuvensestraat 100</p>
          <p>3300 Tienen</p>
          <p><strong>BE0534 968 163</strong></p>
        </div>
        <div class="report-info">
          <h2>STOCK VERIFICATION LIST</h2>
          <p><strong>Date: ${currentDate}</strong></p>
          <p><strong>Time: ${currentTime}</strong></p>
          <p>Location: ${data.currentLocation.toUpperCase()}</p>
        </div>
      </div>
      
      <div class="filter-info">
        <h3>Report Parameters:</h3>
        <p>Location: ${data.currentLocation.toUpperCase()}</p>
        ${data.searchFilter ? `<p>Search Filter: "${data.searchFilter}"</p>` : ''}
        <p>Total Batches: ${data.batches.length}</p>
        <p>Status: IN STOCK ONLY</p>
      </div>
      
      <div class="instructions">
        <h3>Instructions for Stocktaker:</h3>
        <p>1. Count the actual physical stock for each batch listed below</p>
        <p>2. Write the counted quantity in the "Physical Count" column</p>
        <p>3. Note any discrepancies or issues in the "Notes" column</p>
        <p>4. Sign and date at the bottom when completed</p>
      </div>
      
      <table class="stock-table">
        <thead>
          <tr>
            <th style="width: 12%;">Batch Number</th>
            <th style="width: 25%;">Product Name</th>
            <th style="width: 12%;">Production Date</th>
            <th style="width: 12%;">Expiry Date</th>
            <th style="width: 8%;">System Stock</th>
            <th style="width: 12%;">Physical Count</th>
            <th style="width: 15%;">Notes</th>
            <th style="width: 4%;">✓</th>
          </tr>
        </thead>
        <tbody>
          ${data.batches.map(batch => {
            const today = new Date().toISOString().split('T')[0];
            const isExpired = batch.expiry_date && batch.expiry_date < today;
            return `
            <tr style="height: 25px; ${isExpired ? 'background-color: #d0d0d0; border: 2px solid #000; font-weight: bold;' : ''}">
              <td><strong>${batch.batch_number}</strong></td>
              <td>${isExpired ? '*** EXPIRED *** ' : ''}${batch.products.name}</td>
              <td>${new Date(batch.production_date).toLocaleDateString('en-GB')}</td>
              <td style="${isExpired ? 'font-weight: bold; text-decoration: underline;' : ''}">${batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-GB') : '-'}${isExpired ? ' XXX' : ''}</td>
              <td style="text-align: center;"><strong>${batch.packages_in_stock}</strong></td>
              <td class="physical-count" style="background-color: #f0f0f0;"></td>
              <td class="notes" style="background-color: #f0f0f0;"></td>
              <td style="text-align: center; background-color: #f0f0f0;"></td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      
      <div class="signatures">
        <div class="signature-box">
          <h4>Stocktaker Information:</h4>
          <p>Name: ________________________</p>
          <p>Date: ________________________</p>
          <p>Time Started: _________________</p>
          <p>Time Completed: ______________</p>
          <div class="signature-line"></div>
          <p style="text-align: center; margin-top: 2px;">Signature</p>
        </div>
        <div class="signature-box">
          <h4>Supervisor Verification:</h4>
          <p>Name: ________________________</p>
          <p>Date: ________________________</p>
          <p>Discrepancies Found: __________</p>
          <p>Actions Taken: ________________</p>
          <div class="signature-line"></div>
          <p style="text-align: center; margin-top: 2px;">Signature</p>
        </div>
      </div>
      
      <div class="footer">
        <p>TOTHAI Production Kitchen - Stock Verification Report</p>
        <p>This document is for internal stock management and FAVV compliance verification</p>
        <p>Generated on ${currentDate} at ${currentTime}</p>
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