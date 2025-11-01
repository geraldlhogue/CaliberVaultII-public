import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from '../reports/ReportService';
import jsPDF from 'jspdf';

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue('mock-pdf-data')
  }))
}));

describe('ReportService - Comprehensive Tests', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    vi.clearAllMocks();
  });

  describe('PDF Generation', () => {
    it('generates inventory PDF report', async () => {
      const items = [
        { id: '1', name: 'Item 1', category: 'firearms' },
        { id: '2', name: 'Item 2', category: 'ammunition' }
      ];
      
      const pdf = await reportService.generatePDF(items);
      expect(pdf).toBeDefined();
      expect(jsPDF).toHaveBeenCalled();
    });

    it('includes images in PDF', async () => {
      const items = [
        { id: '1', name: 'Item 1', image_url: 'https://example.com/img.jpg' }
      ];
      
      const pdf = await reportService.generatePDF(items, { includeImages: true });
      expect(pdf).toBeDefined();
    });

    it('handles large datasets', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Item ${i}`,
        category: 'firearms'
      }));
      
      await expect(reportService.generatePDF(items)).resolves.not.toThrow();
    });
  });

  describe('CSV Export', () => {
    it('exports inventory to CSV', async () => {
      const items = [
        { id: '1', name: 'Item 1', category: 'firearms' },
        { id: '2', name: 'Item 2', category: 'ammunition' }
      ];
      
      const csv = await reportService.exportCSV(items);
      expect(csv).toContain('name');
      expect(csv).toContain('Item 1');
    });

    it('handles special characters in CSV', async () => {
      const items = [{ id: '1', name: 'Item, with "quotes"', category: 'test' }];
      const csv = await reportService.exportCSV(items);
      expect(csv).toContain('"Item, with ""quotes"""');
    });
  });
});
