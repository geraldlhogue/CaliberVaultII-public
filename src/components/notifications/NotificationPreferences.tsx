import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { EmailService, NotificationPreference } from '@/services/email/EmailService';
import { toast } from '@/hooks/use-toast';

const TRIGGER_TYPES = [
  { value: 'low_stock', label: 'Low Stock Alerts', icon: '📦' },
  { value: 'maintenance_due', label: 'Maintenance Reminders', icon: '🔧' },
  { value: 'security_alert', label: 'Security Alerts', icon: '🔒' },
  { value: 'team_activity', label: 'Team Activity', icon: '👥' },
  { value: 'system_update', label: 'System Updates', icon: '🔔' }
];

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await EmailService.getPreferences();
      const prefMap = data.reduce((acc, pref) => {
        acc[pref.trigger_type] = pref;
        return acc;
      }, {} as Record<string, NotificationPreference>);
      setPreferences(prefMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    triggerType: string,
    updates: Partial<NotificationPreference>
  ) => {
    try {
      const updated = await EmailService.updatePreference(triggerType, updates);
      setPreferences(prev => ({
        ...prev,
        [triggerType]: updated
      }));
      toast({ title: 'Success', description: 'Preferences updated' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      });
    }
  };

  const getPref = (triggerType: string): Partial<NotificationPreference> => {
    return preferences[triggerType] || {
      email_enabled: true,
      in_app_enabled: true,
      frequency: 'immediate'
    };
  };

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Configure how and when you receive notifications
        </p>
      </div>

      <div className="grid gap-4">
        {TRIGGER_TYPES.map((type) => {
          const pref = getPref(type.value);
          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{type.icon}</span>
                  {type.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email Notifications</Label>
                  </div>
                  <Switch
                    checked={pref.email_enabled}
                    onCheckedChange={(checked) =>
                      updatePreference(type.value, { email_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>In-App Notifications</Label>
                  </div>
                  <Switch
                    checked={pref.in_app_enabled}
                    onCheckedChange={(checked) =>
                      updatePreference(type.value, { in_app_enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={pref.frequency || 'immediate'}
                    onValueChange={(value) =>
                      updatePreference(type.value, { frequency: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily_digest">Daily Digest</SelectItem>
                      <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours Start</Label>
                    <Input
                      type="time"
                      value={pref.quiet_hours_start || ''}
                      onChange={(e) =>
                        updatePreference(type.value, { quiet_hours_start: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours End</Label>
                    <Input
                      type="time"
                      value={pref.quiet_hours_end || ''}
                      onChange={(e) =>
                        updatePreference(type.value, { quiet_hours_end: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
