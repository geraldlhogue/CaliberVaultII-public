import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseExcelFile, validateExcelData, excelToInventoryItems } from '@/utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => Promise<void>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen, onClose, onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Invalid File",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const result = await parseExcelFile(selectedFile);
      const items = excelToInventoryItems(result.data);
      setPreview(items.slice(0, 5)); // Show first 5 rows
      
      toast({
        title: "File Loaded",
        description: `Found ${result.rowCount} rows in ${result.sheetName}`
      });
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const result = await parseExcelFile(file);
      const items = excelToInventoryItems(result.data);
      
      await onImport(items);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${items.length} items`
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload">
              <Button type="button" onClick={() => document.getElementById('excel-upload')?.click()}>
                Select Excel File
              </Button>
            </label>
            {file && (
              <div className="mt-4 text-sm text-slate-600">
                Selected: {file.name}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Required Columns:</p>
                <p>Name, Category, Manufacturer, Model, Quantity, Purchase Price</p>
                <p className="mt-2 text-xs">Optional: Serial Number, Location, Notes, Purchase Date</p>
              </div>
            </div>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Preview (First 5 Rows)</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Manufacturer</th>
                      <th className="p-2 text-left">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">{item.manufacturer}</td>
                        <td className="p-2">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!file || loading}
              className="flex-1"
            >
              {loading ? 'Importing...' : 'Import Items'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
