import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  label: string;
  type: 'item' | 'build' | 'location';
}

export default function QRCodeGenerator({ isOpen, onClose, data, label, type }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(JSON.stringify({ type, data }), {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'H'
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [isOpen, type, data]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .label {
              margin-top: 20px;
              font-size: 14px;
              text-align: center;
              max-width: 250px;
            }
            .type {
              margin-top: 10px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <img src="${qrDataUrl}" alt="QR Code" />
          <div class="label">${label}</div>
          <div class="type">Type: ${type.toUpperCase()}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast({ title: 'Print dialog opened' });
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${type}-${Date.now()}.png`;
    a.click();
    toast({ title: 'QR code downloaded' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {label}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">Type: {type.toUpperCase()}</p>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}