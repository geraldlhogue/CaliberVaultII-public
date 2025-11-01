import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  preview?: any[];
}

export const EnhancedBulkImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult>({ success: 0, failed: 0, errors: [] });
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    const template = 'name,category,manufacturer,caliber,quantity,purchase_price,storage_location\n' +
                    'Example Firearm,firearms,Glock,9mm,1,599.99,Safe A\n' +
                    'Example Ammo,ammunition,Federal,9mm,500,0.35,Ammo Cabinet';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_import_template.csv';
    a.click();
    toast.success('Template downloaded');
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    
    return lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const item: any = { row: idx + 2 };
      headers.forEach((h, i) => item[h] = values[i] || '');
      return item;
    });
  };

  const validateItem = (item: any): string | null => {
    if (!item.name) return 'Name is required';
    if (!item.category) return 'Category is required';
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const items = parseCSV(text);
      setPreview(items.slice(0, 5));
      setShowPreview(true);
      toast.success(`Preview: ${items.length} items ready to import`);
    } catch (error: any) {
      toast.error('Failed to parse file: ' + error.message);
    }
  };

  const executeImport = async () => {
    if (preview.length === 0) return;
    
    setImporting(true);
    setProgress(0);
    const newResults: ImportResult = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < preview.length; i++) {
      const item = preview[i];
      const error = validateItem(item);
      
      if (error) {
        newResults.failed++;
        newResults.errors.push({ row: item.row, error });
      } else {
        try {
          const { error: dbError } = await supabase.from('inventory_items').insert([{
            name: item.name,
            category: item.category,
            manufacturer: item.manufacturer,
            caliber: item.caliber,
            quantity: parseInt(item.quantity) || 1,
            purchase_price: parseFloat(item.purchase_price) || 0,
            storage_location: item.storage_location
          }]);
          
          if (dbError) throw dbError;
          newResults.success++;
        } catch (err: any) {
          newResults.failed++;
          newResults.errors.push({ row: item.row, error: err.message });
        }
      }
      
      setProgress(((i + 1) / preview.length) * 100);
    }

    setResults(newResults);
    setImporting(false);
    toast.success(`Import complete: ${newResults.success} succeeded, ${newResults.failed} failed`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Enhanced Bulk Import
        </CardTitle>
        <CardDescription>
          Import multiple items with validation, preview, and detailed error reporting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={importing} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload">
            <Button asChild disabled={importing}><span>Select CSV File</span></Button>
          </label>
        </div>

        {showPreview && preview.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Preview (first 5 rows):</p>
              <div className="max-h-48 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.manufacturer}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={executeImport} disabled={importing} className="mt-4">
                Import {preview.length} Items
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {importing && <Progress value={progress} />}

        {(results.success > 0 || results.failed > 0) && (
          <div className="space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>{results.success} items imported successfully</AlertDescription>
            </Alert>
            {results.failed > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {results.failed} items failed
                  <div className="mt-2 max-h-32 overflow-auto text-xs">
                    {results.errors.map((e, i) => <div key={i}>Row {e.row}: {e.error}</div>)}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
