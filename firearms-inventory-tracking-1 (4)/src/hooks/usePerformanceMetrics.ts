import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'api' | 'render' | 'query';
}

interface PerformanceStats {
  avgApiTime: number;
  avgRenderTime: number;
  avgQueryTime: number;
  totalRequests: number;
  slowestRequest: PerformanceMetric | null;
  recentMetrics: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getStats(): PerformanceStats {
    const apiMetrics = this.metrics.filter(m => m.type === 'api');
    const renderMetrics = this.metrics.filter(m => m.type === 'render');
    const queryMetrics = this.metrics.filter(m => m.type === 'query');

    const avg = (arr: PerformanceMetric[]) => 
      arr.length > 0 ? arr.reduce((sum, m) => sum + m.duration, 0) / arr.length : 0;

    const slowest = this.metrics.reduce((max, m) => 
      !max || m.duration > max.duration ? m : max
    , null as PerformanceMetric | null);

    return {
      avgApiTime: avg(apiMetrics),
      avgRenderTime: avg(renderMetrics),
      avgQueryTime: avg(queryMetrics),
      totalRequests: this.metrics.length,
      slowestRequest: slowest,
      recentMetrics: this.metrics.slice(-10)
    };
  }

  clear() {
    this.metrics = [];
  }
}

const monitor = new PerformanceMonitor();

export function usePerformanceMetrics() {
  const [stats, setStats] = useState<PerformanceStats>(monitor.getStats());

  const trackMetric = useCallback((name: string, type: PerformanceMetric['type'], duration: number) => {
    monitor.addMetric({
      name,
      duration,
      timestamp: Date.now(),
      type
    });
    setStats(monitor.getStats());
  }, []);

  const measureAsync = useCallback(async <T,>(
    name: string,
    type: PerformanceMetric['type'],
    fn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      trackMetric(name, type, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      trackMetric(`${name} (error)`, type, duration);
      throw error;
    }
  }, [trackMetric]);

  const clearMetrics = useCallback(() => {
    monitor.clear();
    setStats(monitor.getStats());
  }, []);

  return {
    stats,
    trackMetric,
    measureAsync,
    clearMetrics
  };
}
