import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface QRLabelSettings {
  size: number;
  includeText: boolean;
  includeSerial: boolean;
  includeName: boolean;
  includeLocation: boolean;
  labelFormat: 'single' | 'sheet';
  labelsPerRow: number;
}

interface QRLabelProps {
  item?: any;
  onClose?: () => void;
}

export function QRCodeLabels({ item, onClose }: QRLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<QRLabelSettings>({
    size: 200,
    includeText: true,
    includeSerial: true,
    includeName: true,
    includeLocation: false,
    labelFormat: 'single',
    labelsPerRow: 3
  });
  
  const [customData, setCustomData] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string>('');

  const generateQRCode = async () => {
    try {
      const data = item ? {
        id: item.id,
        name: item.name,
        serial: item.serial_number,
        location: item.location,
        category: item.category
      } : JSON.parse(customData || '{}');

      const qrData = JSON.stringify(data);
      
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: settings.size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Add text labels if enabled
        if (settings.includeText && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#000';
            let yPos = settings.size + 20;
            
            if (settings.includeName && item?.name) {
              ctx.fillText(item.name, 10, yPos);
              yPos += 15;
            }
            
            if (settings.includeSerial && item?.serial_number) {
              ctx.fillText(`S/N: ${item.serial_number}`, 10, yPos);
              yPos += 15;
            }
            
            if (settings.includeLocation && item?.location) {
              ctx.fillText(`Loc: ${item.location}`, 10, yPos);
            }
          }
        }

        const dataUrl = canvasRef.current.toDataURL();
        setGeneratedQR(dataUrl);
        toast.success('QR code generated successfully');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!generatedQR) {
      toast.error('Please generate a QR code first');
      return;
    }

    const link = document.createElement('a');
    link.download = `qr-label-${item?.serial_number || 'custom'}.png`;
    link.href = generatedQR;
    link.click();
    toast.success('QR code downloaded');
  };

  const printQRCode = () => {
    if (!generatedQR) {
      toast.error('Please generate a QR code first');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Label</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .label {
                display: inline-block;
                margin: 10px;
                padding: 10px;
                border: 1px solid #ddd;
                text-align: center;
              }
              img { max-width: 100%; }
              .text { margin-top: 10px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="label">
              <img src="${generatedQR}" />
              ${settings.includeText ? `
                <div class="text">
                  ${settings.includeName && item?.name ? `<div>${item.name}</div>` : ''}
                  ${settings.includeSerial && item?.serial_number ? `<div>S/N: ${item.serial_number}</div>` : ''}
                  ${settings.includeLocation && item?.location ? `<div>Loc: ${item.location}</div>` : ''}
                </div>
              ` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateBulkLabels = () => {
    // This would generate multiple labels for printing on label sheets
    toast.info('Bulk label generation would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            QR Label Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size">QR Code Size (px)</Label>
              <Input
                id="size"
                type="number"
                value={settings.size}
                onChange={(e) => setSettings({ ...settings, size: parseInt(e.target.value) })}
                min="100"
                max="500"
              />
            </div>
            
            <div>
              <Label htmlFor="format">Label Format</Label>
              <Select 
                value={settings.labelFormat} 
                onValueChange={(value: 'single' | 'sheet') => 
                  setSettings({ ...settings, labelFormat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Label</SelectItem>
                  <SelectItem value="sheet">Label Sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Include on Label:</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeText}
                  onChange={(e) => setSettings({ ...settings, includeText: e.target.checked })}
                />
                Text Labels
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeName}
                  onChange={(e) => setSettings({ ...settings, includeName: e.target.checked })}
                />
                Item Name
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeSerial}
                  onChange={(e) => setSettings({ ...settings, includeSerial: e.target.checked })}
                />
                Serial Number
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeLocation}
                  onChange={(e) => setSettings({ ...settings, includeLocation: e.target.checked })}
                />
                Location
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generate QR Code Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!item && (
            <div>
              <Label htmlFor="custom">Custom Data (JSON)</Label>
              <textarea
                id="custom"
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder='{"id": "123", "name": "Item Name", "serial": "SN123"}'
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
              />
            </div>
          )}

          {item && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Item Information:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {item.name}</p>
                <p><strong>Serial:</strong> {item.serial_number}</p>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Location:</strong> {item.location || 'Not set'}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={generateQRCode} className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
            
            {settings.labelFormat === 'sheet' && (
              <Button onClick={generateBulkLabels} variant="outline">
                Generate Sheet
              </Button>
            )}
          </div>

          {/* Canvas for QR Code */}
          <div className="flex justify-center p-4 border rounded-md bg-white">
            <canvas 
              ref={canvasRef}
              width={settings.size}
              height={settings.size + (settings.includeText ? 60 : 0)}
            />
          </div>

          {generatedQR && (
            <div className="flex gap-2">
              <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={printQRCode} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}