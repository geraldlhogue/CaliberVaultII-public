import { supabase } from '@/lib/supabase';
import { Team, TeamMember, TeamInvitation } from './TeamService';

export class TeamServiceMethods {
  static async updateTeam(id: string, updates: Partial<Team>) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteTeam(id: string) {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
  }

  static async getTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, user_profiles(*)')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async addTeamMember(teamId: string, userId: string, role: string = 'member') {
    const { data: { user } } = await supabase.auth.getUser();
    const permissions = {
      can_view: true,
      can_edit: role === 'admin' || role === 'editor' || role === 'owner',
      can_delete: role === 'admin' || role === 'owner',
      can_share: role === 'admin' || role === 'editor' || role === 'owner',
      can_manage_members: role === 'admin' || role === 'owner'
    };
    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: userId, role, permissions, invited_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
