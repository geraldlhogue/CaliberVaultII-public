import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ExportQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: any[];
  sqlQuery: string;
}

export function ExportQueryModal({ open, onOpenChange, results, sqlQuery }: ExportQueryModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [filename, setFilename] = useState('query_results');
  const [exporting, setExporting] = useState(false);

  const handleExportResults = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-query-results', {
        body: { results, format, filename }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format === 'excel' ? 'xls' : format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Results exported successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportSQL = () => {
    const blob = new Blob([sqlQuery], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SQL query exported');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Query</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Filename</Label>
            <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
          </div>
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportResults} disabled={exporting} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
            <Button onClick={handleExportSQL} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Export SQL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
