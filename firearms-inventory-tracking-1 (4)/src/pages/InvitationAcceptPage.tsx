import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeamInvitationService } from '@/services/team/TeamInvitationService';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Users, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMemberOnboarding } from '@/components/onboarding/TeamMemberOnboarding';


export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);


  useEffect(() => {
    checkAuthAndValidate();
  }, [token]);

  const checkAuthAndValidate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      const validation = await TeamInvitationService.validateInvitation(token);
      
      if (!validation.valid) {
        setError(validation.reason || 'Invalid invitation');
      } else {
        setInvitation(validation.invitation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      toast.info('Please sign in to accept this invitation');
      const returnUrl = `/invite/${token}`;
      navigate(`/?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setProcessing(true);
    try {
      const result = await TeamInvitationService.acceptInvitation(token!, user.id);
      toast.success('Successfully joined the team!');
      
      // Get the newly created team member record
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id, role, permissions')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .single();

      if (teamMember) {
        setTeamMemberId(teamMember.id);
        setShowOnboarding(true);
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
      setProcessing(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/');
  };


  const handleDecline = async () => {
    setProcessing(true);
    try {
      await TeamInvitationService.rejectInvitation(token!);
      toast.success('Invitation declined');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            <p className="text-slate-400">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-500">
              <Users className="h-6 w-6" />
              <CardTitle>Team Invitation</CardTitle>
            </div>
            <CardDescription>
              You've been invited to join a team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Team Name</p>
                  <p className="text-lg font-semibold text-white">{invitation?.teams?.name}</p>
                </div>
                {invitation?.teams?.description && (
                  <div>
                    <p className="text-sm text-slate-400">Description</p>
                    <p className="text-slate-300">{invitation.teams.description}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span>Invited: {invitation?.invitee_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {new Date(invitation?.expires_at).toLocaleDateString()}</span>
                </div>
              </div>

              {!user && (
                <Alert>
                  <AlertDescription>
                    You need to sign in or create an account to accept this invitation.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={processing}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showOnboarding && teamMemberId && invitation && (
        <TeamMemberOnboarding
          open={showOnboarding}
          teamName={invitation.teams?.name || 'Team'}
          inviterName={invitation.inviter_name || 'Team Admin'}
          role={invitation.role || 'member'}
          permissions={invitation.permissions || ['view_inventory', 'edit_inventory']}
          teamMemberId={teamMemberId}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}

