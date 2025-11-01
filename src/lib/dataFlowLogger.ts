// Data Flow Logger - Tracks the journey of data through the system
export interface FlowLogEntry {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  duration?: number;
  data?: any;
  error?: string;
  category?: string;
}

class DataFlowLogger {
  private logs: FlowLogEntry[] = [];
  private listeners: ((logs: FlowLogEntry[]) => void)[] = [];
  private currentFlowId: string | null = null;
  private stepStartTimes: Map<string, number> = new Map();

  startFlow(category: string): string {
    this.currentFlowId = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.logs = [];
    this.stepStartTimes.clear();
    
    this.log({
      id: this.currentFlowId,
      step: 'flow-started',
      status: 'success',
      timestamp: Date.now(),
      category,
      data: { category }
    });
    
    return this.currentFlowId;
  }

  startStep(step: string, data?: any) {
    if (!this.currentFlowId) return;
    
    this.stepStartTimes.set(step, Date.now());
    
    this.log({
      id: `${this.currentFlowId}-${step}`,
      step,
      status: 'running',
      timestamp: Date.now(),
      data
    });
  }

  completeStep(step: string, data?: any) {
    if (!this.currentFlowId) return;
    
    const startTime = this.stepStartTimes.get(step) || Date.now();
    const duration = Date.now() - startTime;
    
    this.log({
      id: `${this.currentFlowId}-${step}`,
      step,
      status: 'success',
      timestamp: Date.now(),
      duration,
      data
    });
  }

  errorStep(step: string, error: string, data?: any) {
    if (!this.currentFlowId) return;
    
    const startTime = this.stepStartTimes.get(step) || Date.now();
    const duration = Date.now() - startTime;
    
    this.log({
      id: `${this.currentFlowId}-${step}`,
      step,
      status: 'error',
      timestamp: Date.now(),
      duration,
      error,
      data
    });
  }

  private log(entry: FlowLogEntry) {
    // Update existing entry or add new one
    const existingIndex = this.logs.findIndex(l => l.id === entry.id);
    if (existingIndex >= 0) {
      this.logs[existingIndex] = entry;
    } else {
      this.logs.push(entry);
    }
    
    // Notify listeners
    this.notifyListeners();
  }

  subscribe(listener: (logs: FlowLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately send current logs
    listener([...this.logs]);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  getLogs(): FlowLogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.currentFlowId = null;
    this.stepStartTimes.clear();
    this.notifyListeners();
  }
}

export const dataFlowLogger = new DataFlowLogger();
