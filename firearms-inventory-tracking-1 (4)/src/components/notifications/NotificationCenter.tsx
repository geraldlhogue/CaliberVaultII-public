import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Settings, BarChart3, List } from 'lucide-react';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { NotificationPreferences } from './NotificationPreferences';
import { EmailQueueManager } from './EmailQueueManager';
import { EmailDeliveryDashboard } from './EmailDeliveryDashboard';

export function NotificationCenter() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notification Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage email notifications, templates, and delivery tracking
        </p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateEditor />
        </TabsContent>

        <TabsContent value="queue">
          <EmailQueueManager />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailDeliveryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
