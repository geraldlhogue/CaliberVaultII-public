// Performance Monitoring System
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Start timing an operation
  start(name: string, metadata?: Record<string, any>) {
    this.marks.set(name, performance.now());
    if (metadata) {
      this.marks.set(`${name}_metadata`, metadata as any);
    }
  }

  // End timing and record metric
  end(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    const metadata = this.marks.get(`${name}_metadata`) as any;

    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    // Clean up
    this.marks.delete(name);
    this.marks.delete(`${name}_metadata`);

    // Limit stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return duration;
  }

  // Get metrics for a specific operation
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  // Get average duration for an operation
  getAverage(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    this.marks.clear();
  }

  // Get performance summary
  getSummary() {
    const operations = new Set(this.metrics.map(m => m.name));
    const summary: Record<string, any> = {};

    operations.forEach(op => {
      const opMetrics = this.getMetrics(op);
      const durations = opMetrics.map(m => m.duration);
      summary[op] = {
        count: opMetrics.length,
        average: this.getAverage(op),
        min: Math.min(...durations),
        max: Math.max(...durations),
        total: durations.reduce((a, b) => a + b, 0),
      };
    });

    return summary;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper to measure async functions
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.start(name, metadata);
  try {
    const result = await fn();
    performanceMonitor.end(name);
    return result;
  } catch (error) {
    performanceMonitor.end(name);
    throw error;
  }
}
