import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface BarcodeGeneratorProps {
  data: string;
  type: 'qr' | 'barcode';
  size?: number;
  onGenerated?: (dataUrl: string) => void;
}

export default function BarcodeGenerator({ data, type, size = 128, onGenerated }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    
    if (type === 'qr') {
      QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'H'
      }).then(() => {
        if (onGenerated) {
          onGenerated(canvas.toDataURL());
        }
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    } else {
      // Simple barcode simulation using Code 39 pattern
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = size * 2;
      canvas.height = size * 0.6;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      
      const barWidth = canvas.width / (data.length * 2 + 2);
      let x = barWidth;
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        if (charCode % 2 === 0) {
          ctx.fillRect(x, 0, barWidth, canvas.height * 0.8);
        }
        x += barWidth * 2;
      }
      
      if (onGenerated) {
        onGenerated(canvas.toDataURL());
      }
    }
  }, [data, type, size, onGenerated]);

  return <canvas ref={canvasRef} className="hidden" />;
}
