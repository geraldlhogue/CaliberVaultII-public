import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Edit, Trash2, Lock } from 'lucide-react';

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
}

interface ResourcePermission {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  actions: string[];
}

export function AdvancedPermissions() {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [resourcePerms, setResourcePerms] = useState<ResourcePermission[]>([]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const { toast } = useToast();

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const allPermissions = [
    'view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory',
    'view_reports', 'create_reports', 'export_data', 'import_data',
    'manage_users', 'manage_roles', 'view_audit', 'manage_settings',
    'view_analytics', 'manage_backup', 'manage_integrations', 'view_compliance'
  ];

  useEffect(() => {
    loadCustomRoles();
    loadResourcePermissions();
  }, []);

  const loadCustomRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomRoles(data);
      }
    } catch (error) {
      console.error('Error loading custom roles:', error);
    }
  };

  const loadResourcePermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('resource_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setResourcePerms(data);
      }
    } catch (error) {
      console.error('Error loading resource permissions:', error);
    }
  };

  const saveCustomRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('custom_roles')
        .insert({
          organization_id: user.id,
          ...roleForm
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Custom role created' });
      setShowRoleDialog(false);
      loadCustomRoles();
      setRoleForm({ name: '', description: '', permissions: [] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Role deleted' });
      loadCustomRoles();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Advanced Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Custom Roles</TabsTrigger>
            <TabsTrigger value="resources">Resource Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Custom Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Role Name</Label>
                      <Input 
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        placeholder="e.g., Inventory Manager"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input 
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        placeholder="Role description"
                      />
                    </div>
                    <div>
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {allPermissions.map(perm => (
                          <div key={perm} className="flex items-center space-x-2">
                            <Switch
                              checked={roleForm.permissions.includes(perm)}
                              onCheckedChange={(checked) => {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: checked 
                                    ? [...roleForm.permissions, perm]
                                    : roleForm.permissions.filter(p => p !== perm)
                                });
                              }}
                            />
                            <Label className="text-sm">{perm.replace(/_/g, ' ')}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={saveCustomRole}>Create Role</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customRoles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Badge>{role.permissions.length} permissions</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteRole(role.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="resources">
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Resource-level permissions allow fine-grained control</p>
              <p className="text-sm">Grant specific users access to individual items or collections</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
