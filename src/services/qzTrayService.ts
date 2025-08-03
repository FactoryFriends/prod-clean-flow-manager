
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

  // Find ARGOX printer or return default
  static async findArgoxPrinter(): Promise<string | null> {
    try {
      const printers = await this.getPrinters();
      const argoxPrinter = printers.find(printer => 
        printer.toLowerCase().includes('argox') || 
        printer.toLowerCase().includes('d2-250')
      );
      return argoxPrinter || (printers.length > 0 ? printers[0] : null);
    } catch (error) {
      console.error('Error finding ARGOX printer:', error);
      return null;
    }
  }

  // Set the printer to use
  static setPrinter(printerName: string): void {
    this.selectedPrinter = printerName;
  }

  // Generate EPL commands for ARGOX D2-250 thermal printer
  private static generateEPLCommands(labelData: LabelData): string {
    const { qr_code_data } = labelData;
    
    // EPL commands for ARGOX D2-250 (50.8 x 25.4mm label)
    // Clear buffer, set label size, and print commands
    return [
      'N',                                      // Clear buffer
      'q203',                                   // Set label width (203 DPI)
      'Q104,26',                               // Set label height (104 dots = ~13mm)
      'S4',                                    // Set print speed to 4
      `A10,5,0,2,1,1,N,"${qr_code_data.product.substring(0, 20)}"`,        // Product name
      `A10,25,0,1,1,1,N,"${qr_code_data.batch_number}"`,                    // Batch number  
      `A10,40,0,1,1,1,N,"Chef: ${qr_code_data.chef}"`,                      // Chef
      `A10,55,0,1,1,1,N,"Prod: ${qr_code_data.production_date}"`,           // Production date
      `A10,70,0,1,1,1,N,"EXP: ${qr_code_data.expiry_date}"`,               // Expiry date
      `B250,5,0,1,2,2,30,N,"${qr_code_data.batch_number}"`,                // Barcode
      'P1',                                    // Print 1 label
      ''                                       // Empty line for proper termination
    ].join('\r\n');
  }

  // Send labels to printer via QZ Tray
  static async printLabels(printRequest: PrintRequest): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.selectedPrinter) {
        this.selectedPrinter = await this.findArgoxPrinter();
        if (!this.selectedPrinter) {
          throw new Error('No printer available');
        }
      }

      const copies = printRequest.printer_config?.copies || 1;
      
      // Generate EPL commands for each label
      const printData = printRequest.labels.map(label => 
        this.generateEPLCommands(label)
      );

      // Create print configuration
      const config = qz.configs.create(this.selectedPrinter, {
        copies: copies,
        jobName: `OptiThai_Labels_${new Date().getTime()}`
      });

      // Send to printer
      await qz.print(config, printData);
      
      console.log(`Successfully sent ${printRequest.labels.length} labels to printer`);
      return true;
    } catch (error) {
      console.error('Failed to print labels:', error);
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
