import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APIKeyManager } from './APIKeyManager';
import { WebhookManager } from './WebhookManager';
import { APIPlayground } from './APIPlayground';
import { APIDocumentationGenerator } from './APIDocumentationGenerator';
import { Key, Webhook, Play, Book } from 'lucide-react';

export function DeveloperDashboard() {
  const [activeTab, setActiveTab] = useState('keys');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, and access comprehensive API documentation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="playground">
            <Play className="h-4 w-4 mr-2" />
            Playground
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Book className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6">
          <APIKeyManager />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="playground" className="mt-6">
          <APIPlayground />
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <APIDocumentationGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
