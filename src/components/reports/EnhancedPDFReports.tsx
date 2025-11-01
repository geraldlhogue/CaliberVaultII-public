import React, { useState } from 'react';
import { InventoryItem } from '../../types/inventory';
import { toast } from '@/hooks/use-toast';

interface EnhancedPDFReportsProps {
  inventory: InventoryItem[];
}

export const EnhancedPDFReports: React.FC<EnhancedPDFReportsProps> = ({ inventory }) => {
  const [generating, setGenerating] = useState(false);

  const generateFullReport = async () => {
    try {
      setGenerating(true);
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      pdf.setFontSize(18);
      pdf.text('Full Inventory Report', 14, 20);
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      pdf.text(`Total Items: ${inventory.length}`, 14, 40);
      
      pdf.save('full-inventory.pdf');
      toast({ title: 'Report generated' });
    } catch (error) {
      toast({ title: 'PDF failed. Use CSV export.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const generateValueReport = async () => {
    try {
      setGenerating(true);
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      const totalValue = inventory.reduce((sum, item) => sum + item.purchasePrice, 0);
      
      pdf.setFontSize(18);
      pdf.text('Value Report', 14, 20);
      pdf.setFontSize(12);
      pdf.text(`Total Value: $${totalValue.toLocaleString()}`, 14, 30);
      
      pdf.save('value-report.pdf');
      toast({ title: 'Report generated' });
    } catch (error) {
      toast({ title: 'PDF failed. Use CSV export.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const generateInsuranceReport = async () => {
    try {
      setGenerating(true);
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      pdf.setFontSize(18);
      pdf.text('Insurance Documentation', 14, 20);
      
      pdf.save('insurance-report.pdf');
      toast({ title: 'Report generated' });
    } catch (error) {
      toast({ title: 'PDF failed. Use CSV export.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={generateFullReport} disabled={generating} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        {generating ? 'Generating...' : 'Full Report'}
      </button>
      <button onClick={generateValueReport} disabled={generating} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
        Value Report
      </button>
      <button onClick={generateInsuranceReport} disabled={generating} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">
        Insurance Report
      </button>
    </div>
  );
};
