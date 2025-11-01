import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';
import { LABEL_FORMATS, LabelFormat } from './LabelFormats';
import BarcodeGenerator from './BarcodeGenerator';
import { InventoryItem } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

interface EnhancedLabelPrintingProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  locations?: Array<{ id: string; name: string; type: string }>;
}

type BarcodeType = 'qr' | 'barcode';

export default function EnhancedLabelPrinting({ isOpen, onClose, items, locations }: EnhancedLabelPrintingProps) {
  const [selectedFormat, setSelectedFormat] = useState<LabelFormat>(LABEL_FORMATS[0]);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('qr');
  const [labelType, setLabelType] = useState<'items' | 'locations'>('items');
  const [generatedCodes, setGeneratedCodes] = useState<Map<string, string>>(new Map());

  const dataItems = labelType === 'items' ? items : (locations || []);

  const handleCodeGenerated = (itemId: string, dataUrl: string) => {
    setGeneratedCodes(prev => new Map(prev).set(itemId, dataUrl));
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print dialog opened' });
  };

  const handleExportPDF = () => {
    toast({ title: 'PDF export', description: 'Use browser print to PDF for now' });
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Labels ({dataItems.length} items)</DialogTitle>
        </DialogHeader>

        <Tabs value={labelType} onValueChange={(v) => setLabelType(v as any)}>
          <TabsList>
            <TabsTrigger value="items">Item Labels ({items.length})</TabsTrigger>
            <TabsTrigger value="locations">Location Labels ({locations?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value={labelType} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label Format</Label>
                <Select value={selectedFormat.id} onValueChange={(id) => {
                  const format = LABEL_FORMATS.find(f => f.id === id);
                  if (format) setSelectedFormat(format);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LABEL_FORMATS.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Code Type</Label>
                <Select value={barcodeType} onValueChange={(v) => setBarcodeType(v as BarcodeType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="barcode">Barcode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />Print
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />Export PDF
              </Button>
            </div>

            {/* Hidden generators */}
            <div className="hidden">
              {dataItems.map(item => (
                <BarcodeGenerator
                  key={item.id}
                  data={item.serialNumber || item.id}
                  type={barcodeType}
                  size={80}
                  onGenerated={(url) => handleCodeGenerated(item.id, url)}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="border rounded p-4 bg-white" id="printable-labels">
              <style>{`@media print { body * { visibility: hidden; } #printable-labels, #printable-labels * { visibility: visible; } #printable-labels { position: absolute; left: 0; top: 0; } }`}</style>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedFormat.columns}, 1fr)`, gap: '0.1in' }}>
                {dataItems.map(item => {
                  const code = generatedCodes.get(item.id);
                  return (
                    <div key={item.id} style={{ width: `${selectedFormat.width}in`, height: `${selectedFormat.height}in`, border: '1px dashed #ccc', padding: '0.1in', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {code && <img src={code} alt="Code" style={{ width: '0.6in', height: '0.6in' }} />}
                      <div style={{ fontSize: '8px', textAlign: 'center' }}>{item.name?.substring(0, 20)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
