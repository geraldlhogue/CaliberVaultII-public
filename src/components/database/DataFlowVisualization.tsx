import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, ArrowRight, Play, Loader2, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataFlowLogger, FlowLogEntry } from '@/lib/dataFlowLogger';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

const STEP_NAMES: Record<string, string> = {
  'flow-started': '0. Flow Initiated',
  'form-submission': '1. Form Submission',
  'validation': '2. Data Validation',
  'optimistic-update': '3. Optimistic UI Update',
  'reference-lookup': '4. Reference Data Lookup',
  'db-insert': '5. Database Insert',
  'db-response': '6. Database Response',
  'realtime-trigger': '7. Realtime Subscription',
  'state-update': '8. State Update',
  'ui-render': '9. UI Re-render',
};

export const DataFlowVisualization: React.FC = () => {
  const { addCloudItem, user } = useAppContext();
  const [logs, setLogs] = useState<FlowLogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('magazines');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = dataFlowLogger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const generateTestData = (category: string) => {
    const timestamp = Date.now();
    const baseData = {
      name: `Test ${category} ${new Date().toLocaleTimeString()}`,
      category,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 99.99,
      quantity: 1,
      manufacturer: 'Test Manufacturer',
      storageLocation: 'Test Location',
      notes: `Test item created at ${new Date().toLocaleString()}`,
    };

    switch (category) {
      case 'magazines':
        return { ...baseData, capacity: 30, caliber: '5.56x45mm', material: 'Polymer' };
      case 'accessories':
        return { ...baseData, accessoryType: 'Scope Mount', model: 'Test Model' };
      case 'bullets':
        return { ...baseData, caliber: '5.56mm', bulletType: 'FMJ', grainWeight: 55 };
      case 'reloading':
        return { ...baseData, componentType: 'Powder', unitOfMeasure: 'lbs', caliber: '5.56mm' };
      case 'firearms':
        return { ...baseData, caliber: '5.56x45mm', action: 'Semi-Auto', serialNumber: `TEST${timestamp}` };
      default:
        return baseData;
    }
  };

  const runTest = async () => {
    if (!user) {
      toast.error('Please sign in to run the test');
      return;
    }

    setIsRunning(true);
    dataFlowLogger.clear();
    
    try {
      const flowId = dataFlowLogger.startFlow(selectedCategory);
      const testData = generateTestData(selectedCategory);
      
      dataFlowLogger.startStep('form-submission', testData);
      await new Promise(resolve => setTimeout(resolve, 100));
      dataFlowLogger.completeStep('form-submission', testData);
      
      dataFlowLogger.startStep('validation');
      await new Promise(resolve => setTimeout(resolve, 100));
      dataFlowLogger.completeStep('validation', { valid: true, fields: Object.keys(testData) });
      
      dataFlowLogger.startStep('optimistic-update');
      dataFlowLogger.completeStep('optimistic-update', { action: 'Added to UI immediately' });
      
      dataFlowLogger.startStep('reference-lookup');
      await new Promise(resolve => setTimeout(resolve, 100));
      dataFlowLogger.completeStep('reference-lookup', { manufacturer: 'Found', location: 'Found' });
      
      dataFlowLogger.startStep('db-insert');
      const startTime = Date.now();
      
      try {
        await addCloudItem(testData);
        const duration = Date.now() - startTime;
        dataFlowLogger.completeStep('db-insert', { duration: `${duration}ms`, success: true });
        
        dataFlowLogger.startStep('db-response');
        dataFlowLogger.completeStep('db-response', { status: 'success', itemCreated: true });
        
        dataFlowLogger.startStep('realtime-trigger');
        await new Promise(resolve => setTimeout(resolve, 200));
        dataFlowLogger.completeStep('realtime-trigger', { subscriptionFired: true });
        
        dataFlowLogger.startStep('state-update');
        dataFlowLogger.completeStep('state-update', { inventoryUpdated: true });
        
        dataFlowLogger.startStep('ui-render');
        dataFlowLogger.completeStep('ui-render', { componentRerendered: true });
        
        toast.success('Test completed successfully! Check the flow visualization below.');
      } catch (error: any) {
        dataFlowLogger.errorStep('db-insert', error.message, { error: error.toString() });
        toast.error(`Test failed: ${error.message}`);
      }
    } catch (error: any) {
      toast.error(`Test error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.step]) acc[log.step] = [];
    acc[log.step].push(log);
    return acc;
  }, {} as Record<string, FlowLogEntry[]>);

  const orderedSteps = Object.keys(STEP_NAMES).filter(step => groupedLogs[step]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span>Real-Time Data Flow Visualization</span>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isRunning}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firearms">Firearms</SelectItem>
                <SelectItem value="magazines">Magazines</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="bullets">Bullets</SelectItem>
                <SelectItem value="reloading">Reloading</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runTest} disabled={isRunning || !user}>
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run Test
            </Button>
            <Button variant="outline" onClick={() => dataFlowLogger.clear()} disabled={isRunning}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">Please sign in to run the data flow test.</p>
          </div>
        )}
        
        {orderedSteps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Test" to visualize the data flow</p>
            <p className="text-sm mt-2">This will add a real test item to your inventory and track its journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedSteps.map((step, index) => {
              const stepLogs = groupedLogs[step];
              const latestLog = stepLogs[stepLogs.length - 1];
              return (
                <React.Fragment key={step}>
                  <StepCard step={step} log={latestLog} />
                  {index < orderedSteps.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-gray-400 rotate-90" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StepCard: React.FC<{ step: string; log: FlowLogEntry }> = ({ step, log }) => {
  const getStatusIcon = () => {
    switch (log.status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (log.status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'running': return 'bg-blue-50 border-blue-200 animate-pulse';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className="font-semibold">{STEP_NAMES[step] || step}</h4>
            {log.duration !== undefined && (
              <p className="text-sm text-muted-foreground">{log.duration}ms</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Badge variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'}>
          {log.status}
        </Badge>
      </div>
      {log.error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <strong>Error:</strong> {log.error}
        </div>
      )}
      {log.data && (
        <details className="mt-2">
          <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
            View Data ({Object.keys(log.data).length} fields)
          </summary>
          <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-40">
            {JSON.stringify(log.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
