// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const end = performance.now();
    this.recordMetric(`render_${componentName}`, end - start);
  }

  // Measure async operation time
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      this.recordMetric(`async_${operationName}`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric(`async_${operationName}_error`, end - start);
      throw error;
    }
  }

  // Record a metric
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Log slow operations
    if (value > 100) {
      console.warn(`Slow operation detected: ${name} took ${value.toFixed(2)}ms`);
    }
  }

  // Get metrics summary
  getMetricsSummary(name: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((values, name) => {
      result[name] = this.getMetricsSummary(name);
    });
    return result;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memory leak detector
export class MemoryLeakDetector {
  private intervals: Set<NodeJS.Timeout> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private listeners: Map<EventTarget, Map<string, EventListener[]>> = new Map();

  // Track interval
  trackInterval(id: NodeJS.Timeout): void {
    this.intervals.add(id);
  }

  // Track timeout
  trackTimeout(id: NodeJS.Timeout): void {
    this.timeouts.add(id);
  }

  // Track event listener
  trackListener(target: EventTarget, event: string, listener: EventListener): void {
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    const targetListeners = this.listeners.get(target)!;
    if (!targetListeners.has(event)) {
      targetListeners.set(event, []);
    }
    targetListeners.get(event)!.push(listener);
  }

  // Clear all tracked resources
  clearAll(): void {
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    this.listeners.forEach((events, target) => {
      events.forEach((listeners, event) => {
        listeners.forEach(listener => {
          target.removeEventListener(event, listener);
        });
      });
    });
    this.intervals.clear();
    this.timeouts.clear();
    this.listeners.clear();
  }

  // Get leak report
  getReport(): {
    activeIntervals: number;
    activeTimeouts: number;
    activeListeners: number;
  } {
    let listenerCount = 0;
    this.listeners.forEach(events => {
      events.forEach(listeners => {
        listenerCount += listeners.length;
      });
    });

    return {
      activeIntervals: this.intervals.size,
      activeTimeouts: this.timeouts.size,
      activeListeners: listenerCount,
    };
  }
}

// Lazy load images
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

// Request idle callback wrapper
export function whenIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
}