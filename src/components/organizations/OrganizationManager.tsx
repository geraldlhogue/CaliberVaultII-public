import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Users, Plus, Settings, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  role?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

export function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadMembers(selectedOrg.id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organizations where user is owner
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id);

      // Get organizations where user is member
      const { data: memberOrgs, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(*)')
        .eq('user_id', user.id);

      if (ownedError) throw ownedError;
      if (memberError) throw memberError;

      const allOrgs = [
        ...(ownedOrgs || []).map(org => ({ ...org, role: 'owner' })),
        ...(memberOrgs || []).map(m => ({ ...m.organizations, role: m.role }))
      ];

      setOrganizations(allOrgs);
    } catch (error: any) {
      toast.error('Failed to load organizations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*, user_id')
        .eq('organization_id', orgId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error('Failed to load members');
      console.error(error);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Organization created successfully');
      setNewOrgName('');
      setShowCreateForm(false);
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organization');
      console.error(error);
    }
  };

  const inviteMember = async () => {
    if (!selectedOrg || !inviteEmail.trim()) return;

    try {
      // In a real app, you'd send an email invitation
      // For now, we'll just show a success message
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error: any) {
      toast.error('Failed to send invitation');
      console.error(error);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member role updated');
      if (selectedOrg) loadMembers(selectedOrg.id);
    } catch (error: any) {
      toast.error('Failed to update member role');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Organizations & Teams
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage multi-tenant access and team collaboration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Your Organizations</h3>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-slate-900 p-4 rounded-lg space-y-3">
              <Input
                placeholder="Organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <div className="flex gap-2">
                <Button onClick={createOrganization} size="sm">Create</Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {organizations.map(org => (
              <div
                key={org.id}
                className={`bg-slate-900 p-4 rounded-lg cursor-pointer transition ${
                  selectedOrg?.id === org.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedOrg(org)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{org.name}</h4>
                    <p className="text-slate-400 text-sm">/{org.slug}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {org.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {organizations.length === 0 && (
            <Alert className="bg-blue-900/20 border-blue-700">
              <AlertDescription className="text-slate-300">
                Create your first organization to enable team collaboration
              </AlertDescription>
            </Alert>
          )}

          {selectedOrg && (
            <div className="border-t border-slate-700 pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </h3>

              {(selectedOrg.role === 'owner' || selectedOrg.role === 'admin') && (
                <div className="bg-slate-900 p-4 rounded-lg space-y-3">
                  <Input
                    type="email"
                    placeholder="Email address to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={inviteMember} size="sm">
                    Send Invitation
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="bg-slate-900 p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm">{member.email || member.user_id}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.role}
                      </Badge>
                    </div>
                    {(selectedOrg.role === 'owner' || selectedOrg.role === 'admin') && (
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        {selectedOrg.role === 'owner' && <option value="owner">Owner</option>}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
