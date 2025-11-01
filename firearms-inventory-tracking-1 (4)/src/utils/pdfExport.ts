// PDF Export without autotable to avoid io.open errors
interface ReportData {
  title: string;
  data: any;
  type: string;
  period: string;
}

export const generatePDF = async (report: ReportData) => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    pdf.setFontSize(20);
    pdf.text(report.title, pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Report Type: ${report.type}`, 20, 35);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    
    let yPos = 55;
    pdf.setFontSize(14);
    pdf.text('Summary', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Total Value: $${report.data.totalValue?.toLocaleString() || '0'}`, 20, yPos);
    yPos += 7;
    pdf.text(`Current Value: $${report.data.currentValue?.toLocaleString() || '0'}`, 20, yPos);
    yPos += 7;
    pdf.text(`Total Items: ${report.data.itemCount || 0}`, 20, yPos);
    
    pdf.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed. Please use CSV export instead.');
  }
};

export const generatePDFContent = (items: any[], filters: any) => {
  return {
    title: 'Inventory Report',
    items: items.map(item => ({
      name: item.name,
      category: item.category,
      caliber: item.caliber || 'N/A',
      value: item.purchasePrice || 0,
      location: item.storageLocation || 'Unknown'
    })),
    filters,
    totalValue: items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
    totalItems: items.length,
    generatedDate: new Date().toLocaleDateString()
  };
};

export const printPDF = async (content: any) => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text(content.title, 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Total Items: ${content.totalItems}`, 20, 35);
    pdf.text(`Total Value: $${content.totalValue.toLocaleString()}`, 20, 45);
    pdf.text(`Generated: ${content.generatedDate}`, 20, 55);
    
    let yPos = 70;
    pdf.setFontSize(10);
    pdf.text('Name', 20, yPos);
    pdf.text('Category', 80, yPos);
    pdf.text('Value', 140, yPos);
    yPos += 7;
    
    content.items.slice(0, 30).forEach((item: any) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(item.name.substring(0, 25), 20, yPos);
      pdf.text(item.category, 80, yPos);
      pdf.text(`$${item.value.toLocaleString()}`, 140, yPos);
      yPos += 7;
    });
    
    pdf.save('inventory-report.pdf');
  } catch (error) {
    console.error('PDF error:', error);
    throw new Error('PDF failed. Use CSV export.');
  }
};
