
import qz from 'qz-tray';

export interface LabelData {
  batch_id: string;
  label_number: number;
  qr_code_data: {
    batch_number: string;
    product: string;
    production_date: string;
    expiry_date: string;
    package_number: number;
    chef: string;
    location: string;
    package_size: string;
  };
}

export interface PrintRequest {
  labels: LabelData[];
  printer_config?: {
    copies?: number;
    paper_size?: string;
    print_speed?: number;
  };
}

export class QZTrayService {
  private static isConnected = false;
  private static selectedPrinter: string | null = null;

  // Initialize QZ Tray connection
  static async connect(): Promise<boolean> {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      this.isConnected = true;
      console.log('QZ Tray connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Disconnect from QZ Tray
  static async disconnect(): Promise<void> {
    try {
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
      }
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting QZ Tray:', error);
    }
  }

  // Check if QZ Tray is available and connected
  static async checkServiceAvailable(): Promise<boolean> {
    try {
      console.log('Checking QZ Tray service availability...');
      if (!this.isConnected) {
        console.log('Not connected, attempting to connect...');
        await this.connect();
      }
      const isActive = qz.websocket.isActive();
      console.log('QZ Tray status:', { isConnected: this.isConnected, isActive });
      return this.isConnected && isActive;
    } catch (error) {
      console.error('QZ Tray not available:', error);
      return false;
    }
  }

  // Get list of available printers
  static async getPrinters(): Promise<string[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const printers = await qz.printers.find();
      return printers || [];
    } catch (error) {
      console.error('Failed to get printers:', error);
      return [];
    }
  }

  // Find LW650XL printer or return default
  static async findLW650XLPrinter(): Promise<string | null> {
    try {
      const printers = await this.getPrinters();
      const lw650xlPrinter = printers.find(printer => 
        printer.toLowerCase().includes('lw650xl') || 
        printer.toLowerCase().includes('lw-650xl') ||
        printer.toLowerCase().includes('lw 650xl')
      );
      return lw650xlPrinter || (printers.length > 0 ? printers[0] : null);
    } catch (error) {
      console.error('Error finding LW650XL printer:', error);
      return null;
    }
  }

  // Set the printer to use
  static setPrinter(printerName: string): void {
    this.selectedPrinter = printerName;
  }

  // Generate ZPL commands for LW650XL thermal printer
  private static generateZPLCommands(labelData: LabelData): string {
    const { qr_code_data } = labelData;
    
    // ZPL commands for LW650XL (50.8 x 25.4mm label)
    return [
      '^XA',                                                    // Start format
      '^MMT',                                                   // Media type: Thermal transfer
      '^PW406',                                                 // Print width (406 dots for 50.8mm at 203 DPI)
      '^LL203',                                                 // Label length (203 dots for 25.4mm at 203 DPI)
      '^PR4',                                                   // Print speed 4 ips
      '^MD15',                                                  // Media darkness 15
      '^LH0,0',                                                 // Label home position
      '^CF0,20',                                                // Default font
      `^FO10,10^A0N,24,24^FD${qr_code_data.product.substring(0, 18)}^FS`,          // Product name - large and bold
      `^FO10,40^A0N,16,16^FD${qr_code_data.batch_number}^FS`,                      // Batch number
      `^FO10,60^A0N,14,14^FDChef: ${qr_code_data.chef}^FS`,                        // Chef name
      `^FO10,80^A0N,12,12^FD${qr_code_data.production_date}^FS`,                   // Production date
      `^FO10,100^A0N,16,16^FDEXP: ${qr_code_data.expiry_date}^FS`,                 // Expiry date - emphasized
      `^FO280,10^BY2^BCN,60,Y,N,N^FD${qr_code_data.batch_number}^FS`,             // Barcode
      '^PQ1,0,1,Y',                                            // Print quantity: 1 label
      '^XZ'                                                    // End format
    ].join('\n');
  }

  // Send labels to printer via QZ Tray
  static async printLabels(printRequest: PrintRequest): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.selectedPrinter) {
        this.selectedPrinter = await this.findLW650XLPrinter();
        if (!this.selectedPrinter) {
          throw new Error('No printer available');
        }
      }

      console.log('Selected printer:', this.selectedPrinter);
      
      const copies = printRequest.printer_config?.copies || 1;
      
      // Generate ZPL commands for each label
      const printData = printRequest.labels.map(label => 
        this.generateZPLCommands(label)
      );

      console.log('Generated ZPL commands:', printData);

      // Create print configuration for LW650XL thermal printer
      const config = qz.configs.create(this.selectedPrinter, {
        copies: copies,
        jobName: `OptiThai_Labels_${new Date().getTime()}`,
        encoding: 'UTF-8',
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        orientation: 'portrait',
        colorType: 'blackwhite',
        units: 'dots',
        density: 8,
        speed: 4
      });

      console.log('Print config:', config);

      // Send to printer
      await qz.print(config, printData);
      
      console.log(`Successfully sent ${printRequest.labels.length} labels to printer: ${this.selectedPrinter}`);
      return true;
    } catch (error) {
      console.error('Failed to print labels:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  // Get printer status
  static async getPrinterStatus(): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const printers = await this.getPrinters();
      return {
        status: this.isConnected ? 'connected' : 'disconnected',
        available_printers: printers,
        selected_printer: this.selectedPrinter,
        qz_version: qz.version
      };
    } catch (error) {
      console.error('Failed to get printer status:', error);
      return { 
        status: 'error', 
        error: error.message,
        available_printers: [],
        selected_printer: null
      };
    }
  }

  // Get QZ Tray connection status
  static getConnectionStatus(): { connected: boolean; printer: string | null } {
    return {
      connected: this.isConnected && qz.websocket.isActive(),
      printer: this.selectedPrinter
    };
  }
}
