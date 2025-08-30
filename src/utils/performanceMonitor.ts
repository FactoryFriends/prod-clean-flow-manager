import { Logger } from './logger';

interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map();
  private entries: PerformanceEntry[] = [];

  startTimer(name: string): void {
    this.startTimes.set(name, performance.now());
    Logger.debug('Performance timer started', { data: { name } });
  }

  endTimer(name: string): number | null {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      Logger.warn('No start time found for timer', { data: { name } });
      return null;
    }

    const duration = performance.now() - startTime;
    const entry: PerformanceEntry = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.entries.push(entry);
    this.startTimes.delete(name);

    Logger.debug('Performance timer ended', { 
      data: { name, duration: `${duration.toFixed(2)}ms` } 
    });

    // Log slow operations
    if (duration > 1000) {
      Logger.warn('Slow operation detected', { 
        data: { name, duration: `${duration.toFixed(2)}ms` } 
      });
    }

    return duration;
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
  }

  getAverageDuration(name: string): number | null {
    const matchingEntries = this.entries.filter(entry => entry.name === name);
    if (matchingEntries.length === 0) return null;
    
    const totalDuration = matchingEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return totalDuration / matchingEntries.length;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility function for timing async operations
export async function timeAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  performanceMonitor.startTimer(name);
  try {
    const result = await operation();
    return result;
  } finally {
    performanceMonitor.endTimer(name);
  }
}