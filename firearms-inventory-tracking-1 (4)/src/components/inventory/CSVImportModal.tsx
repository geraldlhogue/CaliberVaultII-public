import React, { useState, useCallback } from 'react';
import { parseCSV, mapCSVToInventoryItem, CSVRow } from '@/utils/csvParser';
import { validateCSVRow, ValidationWarning } from '@/utils/csvValidator';
import { downloadSampleCSV } from '@/utils/csvTemplate';
import { InventoryItem } from '@/types/inventory';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { CSVPreviewTable } from './CSVPreviewTable';
import { Upload, Download, AlertCircle } from 'lucide-react';

interface CSVImportModalProps {
  onClose: () => void;
  onImport: (items: Partial<InventoryItem>[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImport }) => {
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [previewItems, setPreviewItems] = useState<Partial<InventoryItem>[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const inventoryFields = [
    { value: '', label: 'Skip Field' },
    { value: 'name', label: 'Name *' },
    { value: 'category', label: 'Category *' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'serialNumber', label: 'Serial Number' },
    { value: 'modelNumber', label: 'Model Number' },
    { value: 'storageLocation', label: 'Storage Location *' },
    { value: 'purchasePrice', label: 'Purchase Price *' },
    { value: 'purchaseDate', label: 'Purchase Date' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'notes', label: 'Notes' },
    { value: 'caliber', label: 'Caliber' },
    { value: 'firearmSubcategory', label: 'Firearm Type' }
  ];

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setCSVHeaders(Object.keys(parsed[0]));
        setCSVData(parsed);
        setStep('mapping');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      processFile(file);
    } else {
      toast({ title: 'Error', description: 'Please upload a CSV file', variant: 'destructive' });
    }
  }, [toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleMapping = () => {
    const items = csvData.map(row => mapCSVToInventoryItem(row, fieldMapping));
    const allWarnings: ValidationWarning[] = [];
    
    csvData.forEach((row, idx) => {
      const rowWarnings = validateCSVRow(row, idx, fieldMapping);
      allWarnings.push(...rowWarnings);
    });
    
    setPreviewItems(items);
    setWarnings(allWarnings);
    setStep('preview');
  };

  const handleEdit = (index: number, field: keyof InventoryItem, value: any) => {
    const updated = [...previewItems];
    updated[index] = { ...updated[index], [field]: value };
    setPreviewItems(updated);
  };

  const handleImport = () => {
    const errors = warnings.filter(w => w.severity === 'error');
    if (errors.length > 0) {
      toast({ 
        title: 'Cannot Import', 
        description: `Fix ${errors.length} errors before importing`,
        variant: 'destructive' 
      });
      return;
    }
    
    onImport(previewItems);
    toast({ title: 'Success', description: `Imported ${previewItems.length} items` });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Import CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                  dragActive ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-600'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-300 mb-2 text-lg">Drag and drop CSV file here</p>
                <p className="text-slate-500 mb-4">or</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-block">
                    Browse Files
                  </span>
                </label>
              </div>
              
              <Button
                onClick={downloadSampleCSV}
                variant="outline"
                className="mt-4 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample Template
              </Button>
            </div>
          )}

          {step === 'mapping' && (
            <div>
              <p className="text-slate-300 mb-4">Map CSV columns to inventory fields:</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {csvHeaders.map(header => (
                  <div key={header} className="flex items-center gap-4">
                    <span className="text-slate-300 w-1/3 font-mono text-sm">{header}</span>
                    <select
                      value={fieldMapping[header] || ''}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, [header]: e.target.value })}
                      className="flex-1 bg-slate-700 text-white rounded px-3 py-2"
                    >
                      {inventoryFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <Button onClick={handleMapping} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700">
                Preview Import
              </Button>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-slate-300">Preview ({previewItems.length} items):</p>
                {warnings.length > 0 && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{warnings.length} issues found</span>
                  </div>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto mb-4 bg-slate-900 rounded-lg p-4">
                <CSVPreviewTable 
                  items={previewItems} 
                  warnings={warnings}
                  onEdit={handleEdit}
                />
              </div>

              {warnings.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-4 mb-4 max-h-32 overflow-y-auto">
                  <h4 className="text-white font-semibold mb-2">Validation Issues:</h4>
                  {warnings.slice(0, 10).map((w, i) => (
                    <div key={i} className={`text-sm mb-1 ${w.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                      Row {w.row + 1}: {w.message}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={() => setStep('mapping')} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleImport} 
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  disabled={warnings.some(w => w.severity === 'error')}
                >
                  Import All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
