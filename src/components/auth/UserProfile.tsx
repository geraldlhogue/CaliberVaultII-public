import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storage.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Shield, Bell, Palette, Save, Camera, Mail, Phone, MapPin } from 'lucide-react';
import { BiometricSettings } from './BiometricSettings';

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    avatar_url: '',
    notifications_email: true,
    notifications_push: false,
    theme: 'system',
    two_factor_enabled: false,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        console.error('Profile load error:', error);
      }
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          avatar_url: data.avatar_url || '',
          notifications_email: data.notifications_email ?? true,
          notifications_push: data.notifications_push ?? false,
          theme: data.theme || 'system',
          two_factor_enabled: data.two_factor_enabled ?? false,
        });
      } else {
        // Set email from auth user if no profile exists
        setProfile(prev => ({ ...prev, email: user.email || '' }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Prepare the profile data
      const profileData = {
        id: user.id,
        full_name: profile.full_name || null,
        phone: profile.phone || null,
        address: profile.address || null,
        avatar_url: profile.avatar_url || null,
        notifications_email: profile.notifications_email,
        notifications_push: profile.notifications_push,
        theme: profile.theme,
        two_factor_enabled: profile.two_factor_enabled,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profile with:', profileData);

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    try {
      console.log('[UserProfile] Starting avatar upload:', file.name);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Use storage service to upload
      const result = await storageService.uploadAvatar(file);
      console.log('[UserProfile] Avatar uploaded successfully:', result);

      // Update profile state with new avatar URL
      setProfile({ ...profile, avatar_url: result.url });
      
      // Save to database immediately
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          avatar_url: result.url,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (updateError) {
        console.error('[UserProfile] Database update error:', updateError);
        throw updateError;
      }

      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      console.error('[UserProfile] Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </div>
            <Button onClick={updateProfile} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
              <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
              <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-2" />Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <BiometricSettings />
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={profile.two_factor_enabled}
                      onCheckedChange={(checked) => 
                        setProfile({ ...profile, two_factor_enabled: checked })
                      }
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full text-red-600">
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={profile.notifications_email}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, notifications_email: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get instant alerts on your device
                    </p>
                  </div>
                  <Switch
                    checked={profile.notifications_push}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, notifications_push: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'system'].map((theme) => (
                    <Button
                      key={theme}
                      variant={profile.theme === theme ? 'default' : 'outline'}
                      onClick={() => setProfile({ ...profile, theme })}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}