import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamService } from '../team/TeamService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'user123' } }, 
        error: null 
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test Team' }, error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test Team' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('TeamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create team', async () => {
    const team = await TeamService.createTeam({ name: 'Test Team' });
    expect(team).toBeDefined();
    expect(team.name).toBe('Test Team');
  });

  it('should add team member', async () => {
    const member = await TeamService.addTeamMember('team123', 'user123', 'member');
    expect(member).toBeDefined();
  });

  it('should list team members', async () => {
    const members = await TeamService.getTeamMembers('team123');
    expect(Array.isArray(members)).toBe(true);
  });

  it('should remove team member', async () => {
    await expect(TeamService.removeTeamMember('member123')).resolves.not.toThrow();
  });

  it('should get teams', async () => {
    const teams = await TeamService.getTeams();
    expect(Array.isArray(teams)).toBe(true);
  });

  it('should update team', async () => {
    const updated = await TeamService.updateTeam('team123', { name: 'Updated Team' });
    expect(updated).toBeDefined();
  });

  it('should delete team', async () => {
    await expect(TeamService.deleteTeam('team123')).resolves.not.toThrow();
  });
});
