import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Edit, Trash2, UserPlus } from 'lucide-react';

interface UserPermission {
  id: string;
  user_id: string;
  email?: string;
  permission_level: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_manage_users: boolean;
  can_view_audit: boolean;
  can_manage_insurance: boolean;
  created_at: string;
}

export function UserPermissions() {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPermission | null>(null);
  const [currentUserPermission, setCurrentUserPermission] = useState<UserPermission | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    permission_level: 'viewer',
    can_view: true,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_export: false,
    can_manage_users: false,
    can_view_audit: false,
    can_manage_insurance: false
  });

  useEffect(() => {
    loadPermissions();
    loadCurrentUserPermission();
  }, []);

  const loadCurrentUserPermission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setCurrentUserPermission(data);
      }
    } catch (error) {
      console.error('Error loading current user permission:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Get user emails for display
      const userIds = data?.map(p => p.user_id) || [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const emailMap = profiles?.reduce((acc, p) => {
          acc[p.user_id] = p.email;
          return acc;
        }, {} as Record<string, string>) || {};

        setPermissions(data?.map(p => ({
          ...p,
          email: emailMap[p.user_id] || 'Unknown'
        })) || []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user ID from email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('email', formData.email)
        .single();

      if (!profile) {
        throw new Error('User not found');
      }

      const permissionData = {
        user_id: profile.user_id,
        granted_by: user.id,
        ...formData
      };

      if (editingUser) {
        const { error } = await supabase
          .from('user_permissions')
          .update(permissionData)
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionData);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: editingUser ? 'Permission updated successfully' : 'Permission added successfully'
      });

      setShowAddDialog(false);
      setEditingUser(null);
      loadPermissions();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permission',
        variant: 'destructive'
      });
    }
  };

  const deletePermission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Permission deleted successfully'
      });
      loadPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete permission',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      permission_level: 'viewer',
      can_view: true,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_export: false,
      can_manage_users: false,
      can_view_audit: false,
      can_manage_insurance: false
    });
  };

  const handleLevelChange = (level: string) => {
    const presets: Record<string, any> = {
      admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_export: true,
        can_manage_users: true,
        can_view_audit: true,
        can_manage_insurance: true
      },
      manager: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_export: true,
        can_manage_users: false,
        can_view_audit: true,
        can_manage_insurance: true
      },
      editor: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: false,
        can_export: true,
        can_manage_users: false,
        can_view_audit: false,
        can_manage_insurance: false
      },
      viewer: {
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_export: false,
        can_manage_users: false,
        can_view_audit: false,
        can_manage_insurance: false
      }
    };

    setFormData({
      ...formData,
      permission_level: level,
      ...presets[level]
    });
  };

  const canManageUsers = currentUserPermission?.can_manage_users || currentUserPermission?.permission_level === 'admin';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canManageUsers ? (
          <div className="text-center py-8 text-muted-foreground">
            You don't have permission to manage users
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User Permission
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit' : 'Add'} User Permission</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>User Email</Label>
                      <Input 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="user@example.com"
                        disabled={!!editingUser}
                      />
                    </div>
                    <div>
                      <Label>Permission Level</Label>
                      <Select value={formData.permission_level} onValueChange={handleLevelChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Specific Permissions</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'can_view', label: 'Can View' },
                          { key: 'can_create', label: 'Can Create' },
                          { key: 'can_edit', label: 'Can Edit' },
                          { key: 'can_delete', label: 'Can Delete' },
                          { key: 'can_export', label: 'Can Export' },
                          { key: 'can_manage_users', label: 'Can Manage Users' },
                          { key: 'can_view_audit', label: 'Can View Audit' },
                          { key: 'can_manage_insurance', label: 'Can Manage Insurance' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Switch
                              checked={formData[key as keyof typeof formData] as boolean}
                              onCheckedChange={(checked) => setFormData({...formData, [key]: checked})}
                            />
                            <Label>{label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleSubmit}>
                      {editingUser ? 'Update' : 'Add'} Permission
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>{perm.email}</TableCell>
                    <TableCell>
                      <Badge variant={getLevelColor(perm.permission_level)}>
                        {perm.permission_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {perm.can_view && <Badge variant="outline">View</Badge>}
                        {perm.can_create && <Badge variant="outline">Create</Badge>}
                        {perm.can_edit && <Badge variant="outline">Edit</Badge>}
                        {perm.can_delete && <Badge variant="outline">Delete</Badge>}
                        {perm.can_export && <Badge variant="outline">Export</Badge>}
                        {perm.can_manage_users && <Badge variant="outline">Users</Badge>}
                        {perm.can_view_audit && <Badge variant="outline">Audit</Badge>}
                        {perm.can_manage_insurance && <Badge variant="outline">Insurance</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(perm);
                            setFormData({
                              email: perm.email || '',
                              permission_level: perm.permission_level,
                              can_view: perm.can_view,
                              can_create: perm.can_create,
                              can_edit: perm.can_edit,
                              can_delete: perm.can_delete,
                              can_export: perm.can_export,
                              can_manage_users: perm.can_manage_users,
                              can_view_audit: perm.can_view_audit,
                              can_manage_insurance: perm.can_manage_insurance
                            });
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePermission(perm.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}