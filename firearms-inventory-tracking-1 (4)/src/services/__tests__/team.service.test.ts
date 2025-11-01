import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamService } from '../team/TeamService';
import { TeamInvitationService } from '../team/TeamInvitationService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } })
    }
  }
}));

describe('Team Collaboration Tests', () => {
  let teamService: TeamService;
  let invitationService: TeamInvitationService;

  beforeEach(() => {
    teamService = new TeamService();
    invitationService = new TeamInvitationService();
    vi.clearAllMocks();
  });

  describe('Team Invitations', () => {
    it('creates team invitation', async () => {
      const invitation = await invitationService.createInvitation({
        email: 'test@example.com',
        role: 'member',
        teamId: 'team-1'
      });
      expect(invitation).toBeDefined();
    });

    it('validates invitation token', async () => {
      const isValid = await invitationService.validateToken('token-123');
      expect(typeof isValid).toBe('boolean');
    });

    it('accepts invitation', async () => {
      await expect(
        invitationService.acceptInvitation('token-123')
      ).resolves.not.toThrow();
    });
  });

  describe('Permissions', () => {
    it('checks user permissions', async () => {
      const hasPermission = await teamService.hasPermission('user-1', 'edit');
      expect(typeof hasPermission).toBe('boolean');
    });

    it('grants permissions to team member', async () => {
      await teamService.grantPermission('user-1', 'admin');
      expect(supabase.from).toHaveBeenCalled();
    });
  });
});
