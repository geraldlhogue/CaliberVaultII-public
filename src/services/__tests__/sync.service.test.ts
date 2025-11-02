import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from '../sync/SyncService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

vi.mock('@/lib/enhancedOfflineQueue', () => ({
  offlineQueue: {
    isProcessing: vi.fn(() => false),
    setProcessing: vi.fn(),
    getPending: vi.fn(() => Promise.resolve([])),
    shouldRetry: vi.fn(() => true),
    markCompleted: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    markFailed: vi.fn(() => Promise.resolve())
  }
}));

vi.mock('../sync/ConflictResolver', () => ({
  conflictResolver: {
    resolve: vi.fn(() => Promise.resolve({ resolution: 'local' }))
  }
}));

describe('SyncService', () => {
  let syncService: SyncService;

  beforeEach(() => {
    syncService = new SyncService();
    vi.clearAllMocks();
  });

  it('should process queue successfully', async () => {
    const result = await syncService.processQueue('user123');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('conflicts');
  });

  it('should subscribe to sync status updates', () => {
    const callback = vi.fn();
    const unsubscribe = syncService.subscribe(callback);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('should not process queue if already processing', async () => {
    const { offlineQueue } = await import('@/lib/enhancedOfflineQueue');
    vi.mocked(offlineQueue.isProcessing).mockReturnValue(true);
    
    const result = await syncService.processQueue('user123');
    expect(result.success).toBe(0);
    expect(result.failed).toBe(0);
  });
});
