import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirearmsService } from '../FirearmsService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('FirearmsService', () => {
  let service: FirearmsService;
  const mockInventoryId = 'inv-123';
  const mockFirearmData = {
    name: 'Test Firearm',
    manufacturer_id: 'mfg-123',
    model: 'Model X',
    quantity: 1,
    firearm_type_id: 'type-123',
    caliber_id: 'cal-123',
    cartridge_id: 'cart-123',
    action_id: 'act-123',
    serial_number: 'SN12345',
    barrel_length: 16,
  };

  beforeEach(() => {
    service = new FirearmsService();
    vi.clearAllMocks();
  });

  describe('createFirearm', () => {
    it('should create firearm with all fields in correct tables', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId, ...mockFirearmData },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createFirearm(mockFirearmData);

      // Verify inventory table insert
      expect(supabase.from).toHaveBeenCalledWith('inventory');
      
      // Verify detail table insert
      expect(supabase.from).toHaveBeenCalledWith('firearm_details');
    });

    it('should use action_id not action text', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createFirearm(mockFirearmData);

      const detailCall = mockInsert.mock.calls.find(
        call => call[0]?.action_id !== undefined
      );
      
      expect(detailCall).toBeDefined();
      expect(detailCall[0].action_id).toBe('act-123');
      expect(detailCall[0].action).toBeUndefined();
    });

    it('should include cartridge_id in detail data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createFirearm(mockFirearmData);

      const detailCall = mockInsert.mock.calls.find(
        call => call[0]?.cartridge_id !== undefined
      );
      
      expect(detailCall).toBeDefined();
      expect(detailCall[0].cartridge_id).toBe('cart-123');
    });
  });
});
