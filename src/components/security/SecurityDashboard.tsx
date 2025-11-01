import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Monitor, AlertTriangle, FileText, Download, Trash } from 'lucide-react';
import { TwoFactorSetup } from './TwoFactorSetup';
import { SessionManager } from './SessionManager';
import { SecurityEvents } from './SecurityEvents';
import { LoginHistory } from './LoginHistory';
import { ComplianceTools } from './ComplianceTools';

export function SecurityDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Security & Compliance
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security, sessions, and compliance settings
        </p>
      </div>

      <Tabs defaultValue="2fa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="2fa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            2FA
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2fa">
          <TwoFactorSetup />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManager />
        </TabsContent>

        <TabsContent value="events">
          <SecurityEvents />
        </TabsContent>

        <TabsContent value="history">
          <LoginHistory />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceTools />
        </TabsContent>
      </Tabs>
    </div>
  );
}
