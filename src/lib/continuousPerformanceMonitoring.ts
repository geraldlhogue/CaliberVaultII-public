// Continuous Performance Monitoring System
import { performanceMonitor } from './performanceMonitoring';
import { coreWebVitals } from './coreWebVitals';

export interface PerformanceBudget {
  metric: string;
  threshold: number;
  severity: 'warning' | 'critical';
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  resolved: boolean;
}

class ContinuousPerformanceMonitor {
  private budgets: PerformanceBudget[] = [
    { metric: 'FCP', threshold: 1800, severity: 'warning' },
    { metric: 'LCP', threshold: 2500, severity: 'critical' },
    { metric: 'CLS', threshold: 0.1, severity: 'warning' },
    { metric: 'FID', threshold: 100, severity: 'warning' },
    { metric: 'TTFB', threshold: 600, severity: 'warning' },
  ];
  
  private alerts: PerformanceAlert[] = [];
  private listeners: ((alert: PerformanceAlert) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  startMonitoring(intervalMs: number = 30000) {
    if (this.monitoringInterval) return;
    
    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceBudgets();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private checkPerformanceBudgets() {
    const vitals = coreWebVitals.getMetrics();
    
    this.budgets.forEach(budget => {
      const value = vitals[budget.metric as keyof typeof vitals];
      if (value && value > budget.threshold) {
        this.createAlert(budget.metric, value, budget.threshold, budget.severity);
      }
    });
  }

  private createAlert(metric: string, value: number, threshold: number, severity: 'warning' | 'critical') {
    const alert: PerformanceAlert = {
      id: `${metric}-${Date.now()}`,
      metric,
      value,
      threshold,
      severity,
      timestamp: Date.now(),
      resolved: false,
    };
    
    this.alerts.push(alert);
    this.notifyListeners(alert);
  }

  onAlert(callback: (alert: PerformanceAlert) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(alert: PerformanceAlert) {
    this.listeners.forEach(listener => listener(alert));
  }

  getAlerts() {
    return this.alerts;
  }

  resolveAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) alert.resolved = true;
  }

  setBudgets(budgets: PerformanceBudget[]) {
    this.budgets = budgets;
  }

  getBudgets() {
    return this.budgets;
  }
}

export const continuousMonitor = new ContinuousPerformanceMonitor();
