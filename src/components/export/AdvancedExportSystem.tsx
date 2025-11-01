import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Download, FileJson, FileSpreadsheet, Image } from 'lucide-react';
import { toast } from 'sonner';

export function AdvancedExportSystem() {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [includeImages, setIncludeImages] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>(['firearms']);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const tables = [
    { id: 'firearms', label: 'Firearms' },
    { id: 'optics', label: 'Optics' },
    { id: 'bullets', label: 'Ammunition' },
    { id: 'suppressors', label: 'Suppressors' },
    { id: 'categories', label: 'Categories' }
  ];

  const exportData = async () => {
    setExporting(true);
    setProgress(0);

    try {
      const exportData: any = {};
      
      for (let i = 0; i < selectedTables.length; i++) {
        const table = selectedTables[i];
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        exportData[table] = data || [];
        setProgress(((i + 1) / selectedTables.length) * 100);
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `export_${Date.now()}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        const table = selectedTables[0];
        const data = exportData[table];
        if (!data || data.length === 0) {
          toast.error('No data to export');
          return;
        }
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row: any) => 
          Object.values(row).map(v => `"${v}"`).join(',')
        ).join('\n');
        content = headers + '\n' + rows;
        filename = `export_${table}_${Date.now()}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      toast.success('Export completed successfully');
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Advanced Export System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Tables to Export</Label>
          {tables.map(table => (
            <div key={table.id} className="flex items-center space-x-2">
              <Checkbox 
                checked={selectedTables.includes(table.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTables([...selectedTables, table.id]);
                  } else {
                    setSelectedTables(selectedTables.filter(t => t !== table.id));
                  }
                }}
              />
              <Label>{table.label}</Label>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox checked={includeImages} onCheckedChange={(checked: boolean) => 
            setIncludeImages(checked)} />
          <Label>Include Images</Label>
        </div>

        {exporting && <Progress value={progress} />}

        <Button onClick={exportData} disabled={exporting || selectedTables.length === 0} 
          className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
}
