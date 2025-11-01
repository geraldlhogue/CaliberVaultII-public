import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Shield, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface QualityGate {
  id: string;
  name: string;
  enabled: boolean;
  threshold: number;
  metric: string;
  action: 'warn' | 'block';
  description: string;
}

export function QualityGateConfig() {
  const [gates, setGates] = useState<QualityGate[]>([
    {
      id: '1',
      name: 'Code Coverage',
      enabled: true,
      threshold: 80,
      metric: 'coverage',
      action: 'block',
      description: 'Minimum code coverage percentage'
    },
    {
      id: '2',
      name: 'Test Pass Rate',
      enabled: true,
      threshold: 100,
      metric: 'pass_rate',
      action: 'block',
      description: 'Percentage of tests that must pass'
    },
    {
      id: '3',
      name: 'Complexity Score',
      enabled: true,
      threshold: 10,
      metric: 'complexity',
      action: 'warn',
      description: 'Maximum cyclomatic complexity'
    },
    {
      id: '4',
      name: 'Security Vulnerabilities',
      enabled: true,
      threshold: 0,
      metric: 'vulnerabilities',
      action: 'block',
      description: 'Maximum number of security issues'
    },
    {
      id: '5',
      name: 'Performance Budget',
      enabled: false,
      threshold: 3000,
      metric: 'load_time',
      action: 'warn',
      description: 'Maximum page load time (ms)'
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadGateConfig();
  }, []);

  const loadGateConfig = async () => {
    const { data, error } = await supabase
      .from('quality_gate_config')
      .select('*')
      .order('name');

    if (data && data.length > 0) {
      setGates(data);
    }
  };

  const updateGate = (id: string, updates: Partial<QualityGate>) => {
    setGates(gates.map(gate => 
      gate.id === id ? { ...gate, ...updates } : gate
    ));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Save to database
      const { error } = await supabase
        .from('quality_gate_config')
        .upsert(gates);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const getActionColor = (action: string) => {
    return action === 'block' ? 'text-red-600' : 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Quality Gate Configuration
            </span>
            <Button 
              onClick={saveConfig} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {saved && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Quality gate configuration saved successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {gates.map((gate) => (
              <Card key={gate.id} className={!gate.enabled ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{gate.name}</h3>
                          <span className={`text-sm font-medium ${getActionColor(gate.action)}`}>
                            {gate.action === 'block' ? '⛔ Blocking' : '⚠️ Warning'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{gate.description}</p>
                      </div>
                      <Switch
                        checked={gate.enabled}
                        onCheckedChange={(enabled) => updateGate(gate.id, { enabled })}
                      />
                    </div>

                    {gate.enabled && (
                      <>
                        <div className="space-y-2">
                          <Label>Threshold: {gate.threshold}{gate.metric === 'coverage' || gate.metric === 'pass_rate' ? '%' : ''}</Label>
                          <Slider
                            value={[gate.threshold]}
                            onValueChange={([threshold]) => updateGate(gate.id, { threshold })}
                            max={gate.metric === 'coverage' || gate.metric === 'pass_rate' ? 100 : 
                                 gate.metric === 'load_time' ? 10000 : 50}
                            step={gate.metric === 'load_time' ? 100 : 1}
                            className="w-full"
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button
                            variant={gate.action === 'warn' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateGate(gate.id, { action: 'warn' })}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Warning Only
                          </Button>
                          <Button
                            variant={gate.action === 'block' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => updateGate(gate.id, { action: 'block' })}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Block Deployment
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}