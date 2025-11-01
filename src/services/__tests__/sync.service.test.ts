import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from '../sync/SyncService';
import { ConflictResolver } from '../sync/ConflictResolver';

describe('SyncService - Comprehensive Tests', () => {
  let syncService: SyncService;
  let conflictResolver: ConflictResolver;

  beforeEach(() => {
    syncService = new SyncService();
    conflictResolver = new ConflictResolver();
    vi.clearAllMocks();
  });

  describe('Queue Management', () => {
    it('adds items to sync queue', async () => {
      const item = { id: '1', name: 'Test Item', category: 'firearms' };
      await syncService.addToQueue('create', item);
      const queue = await syncService.getQueue();
      expect(queue).toHaveLength(1);
    });

    it('processes queue in order', async () => {
      await syncService.addToQueue('create', { id: '1' });
      await syncService.addToQueue('update', { id: '2' });
      await syncService.processQueue();
      const queue = await syncService.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('retries failed operations', async () => {
      const failingOp = { id: '1', shouldFail: true };
      await syncService.addToQueue('create', failingOp);
      await syncService.processQueue();
      const queue = await syncService.getQueue();
      expect(queue[0]?.retryCount).toBeGreaterThan(0);
    });
  });

  describe('Conflict Resolution', () => {
    it('detects conflicts between local and remote', () => {
      const local = { id: '1', updated_at: '2024-01-01', value: 'A' };
      const remote = { id: '1', updated_at: '2024-01-02', value: 'B' };
      const hasConflict = conflictResolver.detectConflict(local, remote);
      expect(hasConflict).toBe(true);
    });

    it('resolves conflicts using last-write-wins', () => {
      const local = { id: '1', updated_at: '2024-01-01', value: 'A' };
      const remote = { id: '1', updated_at: '2024-01-02', value: 'B' };
      const resolved = conflictResolver.resolve(local, remote, 'last-write-wins');
      expect(resolved.value).toBe('B');
    });
  });
});
