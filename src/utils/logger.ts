
interface LogContext {
  component?: string;
  action?: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private static isDevelopment = import.meta.env.DEV;

  static info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context ? { ...context } : '');
    }
  }

  static warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context ? { ...context } : '');
    }
  }

  static error(message: string, context?: LogContext) {
    console.error(`[ERROR] ${message}`, context ? { ...context } : '');
  }

  static debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context ? { ...context } : '');
    }
  }

  static trace(componentName: string, methodName: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[TRACE] ${componentName}.${methodName}`, data || '');
    }
  }
}
