// Core Web Vitals Tracking
export interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface CoreWebVitalsMetrics {
  LCP?: WebVital; // Largest Contentful Paint
  FID?: WebVital; // First Input Delay
  CLS?: WebVital; // Cumulative Layout Shift
  FCP?: WebVital; // First Contentful Paint
  TTFB?: WebVital; // Time to First Byte
  INP?: WebVital; // Interaction to Next Paint
}

class CoreWebVitalsTracker {
  private metrics: CoreWebVitalsMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initTracking();
  }

  private initTracking() {
    // Track LCP
    this.trackLCP();
    // Track FID
    this.trackFID();
    // Track CLS
    this.trackCLS();
    // Track FCP
    this.trackFCP();
    // Track TTFB
    this.trackTTFB();
    // Track INP
    this.trackINP();
  }

  private trackLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.LCP = this.createMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {}
  }

  private trackFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0] as any;
        this.metrics.FID = this.createMetric('FID', entry.processingStart - entry.startTime);
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (e) {}
  }

  private trackCLS() {
    let clsValue = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = this.createMetric('CLS', clsValue);
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (e) {}
  }

  private trackFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0];
        this.metrics.FCP = this.createMetric('FCP', entry.startTime);
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {}
  }

  private trackTTFB() {
    const navEntry = performance.getEntriesByType('navigation')[0] as any;
    if (navEntry) {
      this.metrics.TTFB = this.createMetric('TTFB', navEntry.responseStart);
    }
  }

  private trackINP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        let maxDuration = 0;
        entries.forEach(entry => {
          if (entry.duration > maxDuration) maxDuration = entry.duration;
        });
        if (maxDuration > 0) {
          this.metrics.INP = this.createMetric('INP', maxDuration);
        }
      });
      observer.observe({ type: 'event', buffered: true });
      this.observers.push(observer);
    } catch (e) {}
  }

  private createMetric(name: string, value: number): WebVital {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    
    if (threshold) {
      if (value > threshold.poor) rating = 'poor';
      else if (value > threshold.good) rating = 'needs-improvement';
    }

    return {
      name,
      value,
      rating,
      delta: value,
      id: `${name}-${Date.now()}`
    };
  }

  getMetrics(): CoreWebVitalsMetrics {
    return { ...this.metrics };
  }

  disconnect() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }
}

export const coreWebVitals = new CoreWebVitalsTracker();
