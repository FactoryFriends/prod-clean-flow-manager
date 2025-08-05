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

export class WebSerialPrinterService {
  private static port: any = null;
  private static isConnected = false;

  // Check if Web Serial API is supported
  static isSupported(): boolean {
    return 'serial' in navigator && !!(navigator as any).serial;
  }

  // Request port access from user
  static async requestPort(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API not supported. Please use Chrome or Edge browser.');
      }

      // Request port - allow user to select any USB device
      this.port = await (navigator as any).serial.requestPort();

      console.log('Serial port selected:', this.port.getInfo());
      return true;
    } catch (error) {
      console.error('Failed to request serial port:', error);
      return false;
    }
  }

  // Connect to the selected port
  static async connect(): Promise<boolean> {
    try {
      if (!this.port) {
        throw new Error('No port selected. Call requestPort() first.');
      }

      await this.port.open({ 
        baudRate: 115200,  // Try higher baud rate for LW650XL
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.isConnected = true;
      console.log('Connected to LW650XL printer via Web Serial');
      return true;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Disconnect from port
  static async disconnect(): Promise<void> {
    try {
      if (this.port && this.isConnected) {
        await this.port.close();
        this.isConnected = false;
        console.log('Disconnected from printer');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  // Check if printer is connected
  static getConnectionStatus(): { connected: boolean; portInfo: any } {
    return {
      connected: this.isConnected && this.port !== null,
      portInfo: this.port?.getInfo() || null
    };
  }

  // Generate simple test commands for LW650XL
  private static generateTestCommands(): string {
    return [
      '\x1B@',        // ESC @ - Initialize printer
      'TEST PRINT\n',  // Simple text
      '\x1D\x56\x00'  // Cut paper command
    ].join('');
  }

  // Generate ZPL commands for LW650XL thermal printer  
  private static generateZPLCommands(labelData: LabelData): string {
    const { qr_code_data } = labelData;
    
    return [
      '^XA',                                                    // Start format
      '^CF0,30',                                                // Larger default font
      `^FO50,50^A0N,30,30^FD${qr_code_data.product.substring(0, 15)}^FS`,        // Product name
      `^FO50,100^A0N,20,20^FD${qr_code_data.batch_number}^FS`,                   // Batch number
      `^FO50,130^A0N,20,20^FDExp: ${qr_code_data.expiry_date}^FS`,               // Expiry date
      '^PQ1,0,1,Y',                                            // Print quantity: 1 label
      '^XZ'                                                    // End format
    ].join('\n');
  }

  // Send data to printer via Web Serial
  private static async sendToPrinter(data: string): Promise<void> {
    if (!this.port || !this.isConnected) {
      throw new Error('Printer not connected');
    }

    const writer = this.port.writable?.getWriter();
    if (!writer) {
      throw new Error('Unable to get writer for serial port');
    }

    try {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(data);
      await writer.write(encoded);
      console.log('Data sent to printer:', data);
    } finally {
      writer.releaseLock();
    }
  }

  // Print labels via Web Serial
  static async printLabels(printRequest: PrintRequest): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const portRequested = await this.requestPort();
        if (!portRequested) {
          throw new Error('No printer port selected');
        }
        
        const connected = await this.connect();
        if (!connected) {
          throw new Error('Failed to connect to printer');
        }
      }

      console.log('Printing via Web Serial API...');
      
      const copies = printRequest.printer_config?.copies || 1;
      
      // Generate and send ZPL commands for each label
      for (const label of printRequest.labels) {
        const zplCommands = this.generateZPLCommands(label);
        
        // Send multiple copies if requested
        for (let copy = 0; copy < copies; copy++) {
          await this.sendToPrinter(zplCommands);
          // Small delay between copies
          if (copy < copies - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      console.log(`Successfully sent ${printRequest.labels.length} labels to printer via Web Serial`);
      return true;
    } catch (error) {
      console.error('Failed to print labels via Web Serial:', error);
      throw error;
    }
  }

  // Test printer connection with simple command
  static async testPrinter(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Printer not connected');
      }

      console.log('Testing printer with simple command...');
      const testCmd = this.generateTestCommands();
      await this.sendToPrinter(testCmd);
      
      // Also try a simple ZPL test
      const zplTest = [
        '^XA',
        '^CF0,30',
        '^FO50,50^A0N,30,30^FDTEST PRINT^FS',
        '^PQ1,0,1,Y',
        '^XZ'
      ].join('\n');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.sendToPrinter(zplTest);
      
      console.log('Test commands sent successfully');
      return true;
    } catch (error) {
      console.error('Test print failed:', error);
      throw error;
    }
  }

  // Check if service is available
  static async checkServiceAvailable(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('Web Serial API not supported in this browser');
      return false;
    }

    if (this.isConnected) {
      return true;
    }

    // Check if we have a previously selected port
    const ports = await (navigator as any).serial.getPorts();
    if (ports.length > 0) {
      this.port = ports[0];
      return await this.connect();
    }

    return false;
  }

  // Get printer status
  static async getPrinterStatus(): Promise<any> {
    try {
      const supported = this.isSupported();
      const ports = supported ? await (navigator as any).serial.getPorts() : [];
      
      return {
        status: this.isConnected ? 'connected' : 'disconnected',
        web_serial_supported: supported,
        available_ports: ports.length,
        current_port: this.port?.getInfo() || null,
        browser_compatible: supported
      };
    } catch (error) {
      console.error('Failed to get printer status:', error);
      return { 
        status: 'error', 
        error: error.message,
        web_serial_supported: false,
        available_ports: 0,
        current_port: null
      };
    }
  }
}