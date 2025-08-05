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

declare global {
  interface Window {
    qz: any;
  }
}

export class QZTrayPrinterService {
  private static isInitialized = false;
  private static printerName = "LW650XL";

  // Check if QZ Tray is available
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.qz;
  }

  // Initialize QZ Tray connection
  static async initialize(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        throw new Error('QZ Tray not available. Please install QZ Tray software.');
      }

      if (!this.isInitialized) {
        await window.qz.websocket.connect();
        this.isInitialized = true;
        console.log('QZ Tray connected successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize QZ Tray:', error);
      return false;
    }
  }

  // Get available printers
  static async getPrinters(): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return await window.qz.printers.find();
    } catch (error) {
      console.error('Failed to get printers:', error);
      return [];
    }
  }

  // Generate ZPL commands for thermal printer
  private static generateZPLCommands(labelData: LabelData): string {
    const { qr_code_data } = labelData;
    
    return [
      '^XA',                                                    // Start format
      '^CF0,30',                                                // Default font, larger
      `^FO50,50^A0N,30,30^FD${qr_code_data.product.substring(0, 15)}^FS`,        // Product name
      `^FO50,100^A0N,20,20^FD${qr_code_data.batch_number}^FS`,                   // Batch number
      `^FO50,130^A0N,18,18^FDChef: ${qr_code_data.chef}^FS`,                     // Chef name
      `^FO50,160^A0N,16,16^FD${qr_code_data.production_date}^FS`,                // Production date
      `^FO50,190^A0N,20,20^FDEXP: ${qr_code_data.expiry_date}^FS`,               // Expiry date
      '^PQ1,0,1,Y',                                            // Print quantity: 1 label
      '^XZ'                                                    // End format
    ].join('\n');
  }

  // Print labels via QZ Tray
  static async printLabels(printRequest: PrintRequest): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize QZ Tray');
        }
      }

      console.log('Printing via QZ Tray...');
      
      const copies = printRequest.printer_config?.copies || 1;
      
      // Get available printers and find LW650XL or similar
      const printers = await this.getPrinters();
      let targetPrinter = printers.find(p => p.toLowerCase().includes('lw650')) ||
                         printers.find(p => p.toLowerCase().includes('citizen')) ||
                         printers[0]; // Fallback to first printer

      if (!targetPrinter) {
        throw new Error('No suitable printer found');
      }

      console.log(`Using printer: ${targetPrinter}`);
      
      // Generate and send ZPL commands for each label
      for (const label of printRequest.labels) {
        const zplCommands = this.generateZPLCommands(label);
        
        const config = window.qz.configs.create(targetPrinter);
        const data = [{
          type: 'raw',
          format: 'plain',
          data: zplCommands
        }];
        
        // Send multiple copies if requested
        for (let copy = 0; copy < copies; copy++) {
          await window.qz.print(config, data);
        }
      }
      
      console.log(`Successfully sent ${printRequest.labels.length} labels to printer via QZ Tray`);
      return true;
    } catch (error) {
      console.error('Failed to print labels via QZ Tray:', error);
      throw error;
    }
  }

  // Test printer connection
  static async testPrinter(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize QZ Tray');
        }
      }

      const printers = await this.getPrinters();
      let targetPrinter = printers.find(p => p.toLowerCase().includes('lw650')) ||
                         printers.find(p => p.toLowerCase().includes('citizen')) ||
                         printers[0];

      if (!targetPrinter) {
        throw new Error('No suitable printer found');
      }

      // Send test print
      const config = window.qz.configs.create(targetPrinter);
      const testData = [{
        type: 'raw',
        format: 'plain',
        data: [
          '^XA',
          '^CF0,30',
          '^FO50,50^A0N,30,30^FDTEST PRINT^FS',
          '^FO50,100^A0N,20,20^FDQZ TRAY CONNECTION^FS',
          '^PQ1,0,1,Y',
          '^XZ'
        ].join('\n')
      }];

      await window.qz.print(config, testData);
      console.log('Test print sent successfully via QZ Tray');
      return true;
    } catch (error) {
      console.error('Test print failed:', error);
      throw error;
    }
  }

  // Get printer status
  static async getPrinterStatus(): Promise<any> {
    try {
      const available = this.isAvailable();
      const printers = available ? await this.getPrinters() : [];
      
      return {
        status: this.isInitialized ? 'connected' : 'disconnected',
        qz_tray_available: available,
        available_printers: printers.length,
        printers: printers,
        recommended_printer: printers.find(p => p.toLowerCase().includes('lw650')) || 
                            printers.find(p => p.toLowerCase().includes('citizen')) || 
                            (printers.length > 0 ? printers[0] : null)
      };
    } catch (error) {
      console.error('Failed to get printer status:', error);
      return { 
        status: 'error', 
        error: error.message,
        qz_tray_available: false,
        available_printers: 0,
        printers: []
      };
    }
  }

  // Disconnect QZ Tray
  static async disconnect(): Promise<void> {
    try {
      if (this.isInitialized && window.qz) {
        await window.qz.websocket.disconnect();
        this.isInitialized = false;
        console.log('QZ Tray disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting QZ Tray:', error);
    }
  }
}