import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, BarChart3, PieChart, LineChart, Table } from 'lucide-react';
import { ReportService } from '@/services/reports/ReportService';
import { toast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  type: 'chart' | 'table' | 'metric';
  chartType?: 'bar' | 'pie' | 'line' | 'area';
  dataSource: string;
  title: string;
  config: any;
}

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('inventory');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [saving, setSaving] = useState(false);

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      chartType: type === 'chart' ? 'bar' : undefined,
      dataSource: 'inventory',
      title: `New ${type}`,
      config: {}
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const saveReport = async () => {
    if (!reportName.trim()) {
      toast({ title: 'Error', description: 'Please enter a report name', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await ReportService.saveCustomReport({
        name: reportName,
        description,
        report_type: reportType as any,
        config: { widgets },
        widgets,
        is_favorite: false
      });
      toast({ title: 'Success', description: 'Report saved successfully' });
      setReportName('');
      setDescription('');
      setWidgets([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save report', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Report Name</Label>
            <Input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="My Custom Report" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Report description..." />
          </div>
          <div>
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="valuation">Valuation</SelectItem>
                <SelectItem value="acquisition">Acquisition</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Widgets
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addWidget('chart')}><BarChart3 className="h-4 w-4 mr-1" />Chart</Button>
              <Button size="sm" onClick={() => addWidget('table')}><Table className="h-4 w-4 mr-1" />Table</Button>
              <Button size="sm" onClick={() => addWidget('metric')}><Plus className="h-4 w-4 mr-1" />Metric</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {widgets.map((widget) => (
            <Card key={widget.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                  <div className="flex-1 space-y-3">
                    <Input value={widget.title} onChange={(e) => updateWidget(widget.id, { title: e.target.value })} placeholder="Widget title" />
                    {widget.type === 'chart' && (
                      <Select value={widget.chartType} onValueChange={(v) => updateWidget(widget.id, { chartType: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeWidget(widget.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveReport} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Report'}
      </Button>
    </div>
  );
}
