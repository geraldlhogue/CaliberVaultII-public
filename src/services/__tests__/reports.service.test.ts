import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from '../reports/ReportService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    vi.clearAllMocks();
  });

  it('should generate inventory summary report', async () => {
    const report = await reportService.generateSummaryReport();
    expect(report).toBeDefined();
    expect(Array.isArray(report)).toBe(true);
  });

  it('should generate category breakdown report', async () => {
    const report = await reportService.generateCategoryReport();
    expect(report).toBeDefined();
  });

  it('should generate value report', async () => {
    const report = await reportService.generateValueReport();
    expect(report).toBeDefined();
  });
});
