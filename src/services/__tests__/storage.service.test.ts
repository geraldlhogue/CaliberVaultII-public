import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../storage.service';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
  },
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('uploads file successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.uploadFile(file, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('deleteFile', () => {
    it('deletes file successfully', async () => {
      await expect(service.deleteFile('test.jpg')).resolves.not.toThrow();
    });
  });

  describe('listFiles', () => {
    it('lists files successfully', async () => {
      const files = await service.listFiles('user123');
      expect(Array.isArray(files)).toBe(true);
    });
  });
});
