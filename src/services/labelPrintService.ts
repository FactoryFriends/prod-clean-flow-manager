
// Service for communicating with local ARGOX D2-250 print service
const PRINT_SERVICE_URL = 'http://localhost:8080'; // Local print service endpoint

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

export class LabelPrintService {
  // Check if local print service is available
  static async checkServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/health`, {
        method: 'GET',
        timeout: 2000,
      });
      return response.ok;
    } catch (error) {
      console.log('Print service not available:', error);
      return false;
    }
  }

  // Send labels to local print service
  static async printLabels(printRequest: PrintRequest): Promise<boolean> {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printRequest),
      });

      if (!response.ok) {
        throw new Error(`Print service error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Failed to print labels:', error);
      throw error;
    }
  }

  // Get printer status
  static async getPrinterStatus(): Promise<any> {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/status`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get printer status:', error);
      return { status: 'unknown', error: error.message };
    }
  }
}
