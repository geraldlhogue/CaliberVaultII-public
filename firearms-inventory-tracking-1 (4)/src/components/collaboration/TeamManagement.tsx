import { useState, useEffect } from 'react';
import { TeamService, Team, TeamMember, TeamInvitation } from '@/services/team/TeamService';
import { TeamInvitationService } from '@/services/team/TeamInvitationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Trash2, Shield, Mail, AlertCircle, Clock, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { AdvancedPermissions } from '@/components/permissions/AdvancedPermissions';


export function TeamManagement() {
  const subscription = useSubscription();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');



  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadMembers(selectedTeam.id);
      loadPendingInvites(selectedTeam.id);
    }
  }, [selectedTeam]);


  const loadTeams = async () => {
    try {
      const data = await TeamService.getTeams();
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error: any) {
      toast.error('Failed to load teams: ' + error.message);
    }
  };

  const loadMembers = async (teamId: string) => {
    try {
      const data = await TeamService.getTeamMembers(teamId);
      setMembers(data);
    } catch (error: any) {
      toast.error('Failed to load members: ' + error.message);
    }
  };

  const loadPendingInvites = async (teamId: string) => {
    try {
      const data = await TeamInvitationService.getPendingInvitations(teamId);
      setPendingInvites(data);
    } catch (error: any) {
      console.error('Failed to load pending invites:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setLoading(true);
    try {
      const team = await TeamService.createTeam({ name: newTeamName });
      setTeams([team, ...teams]);
      setNewTeamName('');
      toast.success('Team created successfully');
    } catch (error: any) {
      toast.error('Failed to create team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return;
    
    if (!subscription.canInviteUser()) {
      toast.error(`Team size limit reached (${subscription.userCount}/${subscription.userLimit})`);
      return;
    }
    
    setLoading(true);
    try {
      await TeamInvitationService.createInvitation(selectedTeam.id, newMemberEmail);
      await subscription.refresh();
      loadPendingInvites(selectedTeam.id);
      setNewMemberEmail('');
      toast.success('Invitation sent successfully');
    } catch (error: any) {
      toast.error('Failed to send invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await TeamInvitationService.resendInvitation(inviteId);
      toast.success('Invitation resent');
    } catch (error: any) {
      toast.error('Failed to resend invitation: ' + error.message);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await TeamInvitationService.cancelInvitation(inviteId);
      await subscription.refresh();
      loadPendingInvites(selectedTeam!.id);
      toast.success('Invitation cancelled');
    } catch (error: any) {
      toast.error('Failed to cancel invitation: ' + error.message);
    }
  };


  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return;
    
    // Check if user can invite more members
    if (!subscription.canInviteUser()) {
      toast.error(`Team size limit reached. Your ${subscription.planType || 'Free'} plan allows ${subscription.userLimit} user${subscription.userLimit !== 1 ? 's' : ''}. Upgrade to add more members.`);
      return;
    }
    
    setLoading(true);
    try {
      // In production, you'd look up user by email
      await TeamService.addTeamMember(selectedTeam.id, newMemberEmail, newMemberRole);
      await subscription.refresh();
      loadMembers(selectedTeam.id);
      setNewMemberEmail('');
      toast.success('Member added successfully');
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    
    try {
      await TeamService.removeTeamMember(memberId);
      loadMembers(selectedTeam!.id);
      toast.success('Member removed');
    } catch (error: any) {
      toast.error('Failed to remove member: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Size Usage Alert */}
      {!subscription.canInviteUser() && (
        <Alert className="bg-orange-900/20 border-orange-700">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            Team size limit reached ({subscription.userCount}/{subscription.userLimit} users). 
            Upgrade your plan to add more team members.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Team Management</h2>
          <p className="text-slate-400">
            Manage teams and member permissions ({subscription.userCount}/{subscription.userLimit} users)
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Team Name</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button onClick={handleCreateTeam} disabled={loading} className="w-full">
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Teams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeam?.id === team.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedTeam(team)}
              >
                <Users className="h-4 w-4 mr-2" />
                {team.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {selectedTeam && (
          <Card className="bg-slate-900 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">{selectedTeam.name}</CardTitle>
              <CardDescription className="text-slate-400">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!subscription.canInviteUser() && (
                <Alert className="bg-yellow-900/20 border-yellow-700">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200 text-sm">
                    You've reached your team size limit. Remove a member or upgrade to add more.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="User ID or email"
                  className="bg-slate-800 border-slate-700 text-white"
                  disabled={!subscription.canInviteUser()}
                />
                <Select 
                  value={newMemberRole} 
                  onValueChange={setNewMemberRole}
                  disabled={!subscription.canInviteUser()}
                >
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSendInvite} 
                  disabled={loading || !subscription.canInviteUser()}
                  title={!subscription.canInviteUser() ? 'Team size limit reached' : 'Send invite'}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>

              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Invitations ({pendingInvites.length})
                  </h3>
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-white font-medium">{invite.invitee_email}</p>
                          <p className="text-xs text-slate-400">
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(invite.id)}
                          title="Resend invitation"
                        >
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvite(invite.id)}
                          title="Cancel invitation"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}



              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-white font-medium">{member.user_id}</p>
                        <p className="text-sm text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
