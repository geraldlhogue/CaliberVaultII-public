import { supabase } from '@/lib/supabase';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'member';
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_share: boolean;
    can_manage_members: boolean;
  };
  invited_by?: string;
  joined_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedItem {
  id: string;
  team_id: string;
  item_type: string;
  item_id: string;
  shared_by: string;
  access_level: 'view' | 'edit' | 'full';
  shared_at: string;
}

export class TeamService {
  static async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members(count)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTeam(team: Partial<Team>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('teams')
      .insert({ ...team, owner_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    await this.addTeamMember(data.id, user.id, 'owner');
    return data;
  }

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

  static async updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async removeTeamMember(id: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
  }

  static async getSharedItems(teamId: string) {
    const { data, error } = await supabase
      .from('shared_items')
      .select('*')
      .eq('team_id', teamId)
      .order('shared_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async shareItem(teamId: string, itemType: string, itemId: string, accessLevel: string = 'view') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('shared_items')
      .insert({ team_id: teamId, item_type: itemType, item_id: itemId, shared_by: user.id, access_level: accessLevel })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async unshareItem(id: string) {
    const { error } = await supabase.from('shared_items').delete().eq('id', id);
    if (error) throw error;
  }
}
