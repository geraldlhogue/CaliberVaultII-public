import { supabase } from '@/lib/supabase';
import { TeamInvitation } from './TeamService';
import { TeamService } from './TeamService';

export class TeamInvitationService {
  static async createInvitation(teamId: string, email: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({ team_id: teamId, inviter_id: user.id, invitee_email: email })
      .select()
      .single();
    
    if (error) throw error;

    // Send email notification
    await supabase.functions.invoke('send-email-notification', {
      body: { 
        to: email, 
        type: 'team_invitation',
        data: { teamId, invitationId: data.id }
      }
    });
    
    return data;
  }

  static async getPendingInvitations(teamId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async resendInvitation(invitationId: string) {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();
    
    if (error) throw error;

    await supabase.functions.invoke('send-email-notification', {
      body: { 
        to: data.invitee_email, 
        type: 'team_invitation',
        data: { teamId: data.team_id, invitationId: data.id }
      }
    });
  }

  static async cancelInvitation(invitationId: string) {
    const { error } = await supabase
      .from('team_invitations')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', invitationId);
    
    if (error) throw error;
  }

  static async getInvitationByToken(token: string) {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*, teams(name, description, owner_id)')
      .eq('id', token)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async validateInvitation(token: string): Promise<{
    valid: boolean;
    reason?: string;
    invitation?: any;
  }> {
    try {
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        return { valid: false, reason: 'Invitation not found' };
      }

      if (invitation.status !== 'pending') {
        return { valid: false, reason: `Invitation already ${invitation.status}` };
      }

      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        // Mark as expired
        await supabase
          .from('team_invitations')
          .update({ status: 'expired' })
          .eq('id', token);
        return { valid: false, reason: 'Invitation has expired' };
      }

      return { valid: true, invitation };
    } catch (error) {
      return { valid: false, reason: 'Invalid invitation' };
    }
  }

  static async acceptInvitation(token: string, userId: string) {
    const validation = await this.validateInvitation(token);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const invitation = validation.invitation;

    // Create team member record
    await TeamService.addTeamMember(invitation.team_id, userId, 'member');

    // Update invitation status
    const { error } = await supabase
      .from('team_invitations')
      .update({ 
        status: 'accepted', 
        accepted_at: new Date().toISOString() 
      })
      .eq('id', token);
    
    if (error) throw error;

    return invitation;
  }

  static async rejectInvitation(token: string) {
    const { error } = await supabase
      .from('team_invitations')
      .update({ 
        status: 'rejected', 
        rejected_at: new Date().toISOString() 
      })
      .eq('id', token);
    
    if (error) throw error;
  }
}

