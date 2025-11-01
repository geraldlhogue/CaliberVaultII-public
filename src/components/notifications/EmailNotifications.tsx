import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { Mail, Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  lowStockAlerts: boolean;
  dailyReports: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  backupNotifications: boolean;
}

interface NotificationHistory {
  id: string;
  subject: string;
  type: string;
  status: string;
  sent_at: string;
}

export function EmailNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    lowStockAlerts: true,
    dailyReports: false,
    weeklyDigest: true,
    securityAlerts: true,
    backupNotifications: true
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [notificationType, setNotificationType] = useState('general');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    loadNotificationHistory();
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    toast.success('Notification settings saved');
  };

  const loadNotificationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to send notifications');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: testEmail || user.email,
          subject: customSubject || 'Test Notification from Inventory System',
          body: customBody || 'This is a test notification from your inventory management system.',
          type: notificationType
        }
      });

      if (error) throw error;
      
      toast.success('Test notification sent successfully');
      loadNotificationHistory();
      
      // Clear form
      setTestEmail('');
      setCustomSubject('');
      setCustomBody('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="low-stock">Low Stock Alerts</Label>
            <Switch
              id="low-stock"
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => 
                saveSettings({ ...settings, lowStockAlerts: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="daily">Daily Reports</Label>
            <Switch
              id="daily"
              checked={settings.dailyReports}
              onCheckedChange={(checked) => 
                saveSettings({ ...settings, dailyReports: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly">Weekly Digest</Label>
            <Switch
              id="weekly"
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => 
                saveSettings({ ...settings, weeklyDigest: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="security">Security Alerts</Label>
            <Switch
              id="security"
              checked={settings.securityAlerts}
              onCheckedChange={(checked) => 
                saveSettings({ ...settings, securityAlerts: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="backup">Backup Notifications</Label>
            <Switch
              id="backup"
              checked={settings.backupNotifications}
              onCheckedChange={(checked) => 
                saveSettings({ ...settings, backupNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Send Test Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Leave empty to use your account email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="type">Notification Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Notification subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              placeholder="Notification message"
              rows={4}
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={sendTestNotification}
            disabled={sending}
            className="w-full"
          >
            {sending ? 'Sending...' : 'Send Test Notification'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground">No notifications sent yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium text-sm">{notification.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.type} • {new Date(notification.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}