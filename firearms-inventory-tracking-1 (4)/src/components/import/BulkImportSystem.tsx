import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '@/contexts/AppContext';

export const BulkImportSystem: React.FC = () => {
  const { addCloudItem } = useAppContext();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1);

      for (let i = 0; i < data.length; i++) {
        const values = data[i].split(',').map(v => v.trim());
        const item: any = {};
        headers.forEach((h, idx) => {
          item[h] = values[idx];
        });

        try {
          await addCloudItem(item);
          setResults(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (error: any) {
          setResults(prev => ({ 
            ...prev, 
            failed: prev.failed + 1,
            errors: [...prev.errors, `Row ${i + 2}: ${error.message}`]
          }));
        }

        setProgress(((i + 1) / data.length) * 100);
      }

      toast.success(`Import complete! ${results.success} items added`);
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  }, [addCloudItem, results.success]);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import System
        </CardTitle>
        <CardDescription className="text-slate-400">
          Import multiple items from CSV with validation and progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-4">Drag and drop CSV file or click to browse</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
            id="bulk-import"
          />
          <label htmlFor="bulk-import">
            <Button asChild disabled={importing}>
              <span>Select CSV File</span>
            </Button>
          </label>
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Importing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {(results.success > 0 || results.failed > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>{results.success} items imported successfully</span>
            </div>
            {results.failed > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{results.failed} items failed</span>
                </div>
                <div className="bg-slate-900 p-3 rounded max-h-40 overflow-y-auto">
                  {results.errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-red-400">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900 p-4 rounded-lg">
          <h4 className="text-white font-bold mb-2">CSV Format</h4>
          <p className="text-slate-400 text-sm mb-2">Your CSV should have these columns:</p>
          <code className="text-xs text-green-400">
            name,category,manufacturer,caliber,purchasePrice,storageLocation
          </code>
        </div>
      </CardContent>
    </Card>
  );
};