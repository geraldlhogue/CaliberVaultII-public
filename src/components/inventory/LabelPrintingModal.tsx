import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download } from 'lucide-react';
import { LABEL_FORMATS, LabelFormat } from './LabelFormats';
import BarcodeGenerator from './BarcodeGenerator';
import { InventoryItem } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

interface LabelPrintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export default function LabelPrintingModal({ isOpen, onClose, items }: LabelPrintingModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<LabelFormat>(LABEL_FORMATS[0]);
  const [codeType, setCodeType] = useState<'qr' | 'barcode'>('qr');
  const [generatedCodes, setGeneratedCodes] = useState<Map<string, string>>(new Map());

  const handleCodeGenerated = (itemId: string, dataUrl: string) => {
    setGeneratedCodes(prev => new Map(prev).set(itemId, dataUrl));
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print dialog opened' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Labels ({items.length} items)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Label Format</label>
              <Select value={selectedFormat.id} onValueChange={(id) => {
                const format = LABEL_FORMATS.find(f => f.id === id);
                if (format) setSelectedFormat(format);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_FORMATS.map(format => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name} - {format.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Code Type</label>
              <Select value={codeType} onValueChange={(v) => setCodeType(v as 'qr' | 'barcode')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qr">QR Code</SelectItem>
                  <SelectItem value="barcode">Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Labels
            </Button>
          </div>

          {/* Hidden barcode generators */}
          <div className="hidden">
            {items.map(item => (
              <BarcodeGenerator
                key={item.id}
                data={item.serialNumber || item.id}
                type={codeType}
                size={80}
                onGenerated={(url) => handleCodeGenerated(item.id, url)}
              />
            ))}
          </div>

          {/* Print preview */}
          <div className="print-preview border rounded-lg p-4 bg-white" id="printable-labels">
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #printable-labels, #printable-labels * { visibility: visible; }
                #printable-labels { position: absolute; left: 0; top: 0; }
              }
            `}</style>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${selectedFormat.columns}, 1fr)`,
              gap: `${selectedFormat.verticalGap}in ${selectedFormat.horizontalGap}in`,
              padding: `${selectedFormat.marginTop}in ${selectedFormat.marginRight}in ${selectedFormat.marginBottom}in ${selectedFormat.marginLeft}in`
            }}>
              {items.map(item => {
                const codeUrl = generatedCodes.get(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      width: `${selectedFormat.width}in`,
                      height: `${selectedFormat.height}in`,
                      border: '1px dashed #ccc',
                      padding: '0.1in',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: selectedFormat.height < 1 ? '6px' : '8px',
                      overflow: 'hidden'
                    }}
                  >
                    {codeUrl && (
                      <img 
                        src={codeUrl} 
                        alt="Code" 
                        style={{ 
                          width: selectedFormat.height < 1 ? '0.3in' : '0.6in',
                          height: selectedFormat.height < 1 ? '0.3in' : '0.6in',
                          marginBottom: '2px'
                        }} 
                      />
                    )}
                    <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>
                        {item.name.substring(0, 20)}
                      </div>
                      {item.serialNumber && (
                        <div>SN: {item.serialNumber.substring(0, 15)}</div>
                      )}
                      {item.location && (
                        <div>{item.location.substring(0, 15)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
