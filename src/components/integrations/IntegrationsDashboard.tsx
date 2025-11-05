import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudStorageManager } from './CloudStorageManager';
import { InsuranceManager } from './InsuranceManager';
import { SmartRecommendations } from '../ai/SmartRecommendations';
import { DuplicateDetector } from '../ai/DuplicateDetector';
import { FeatureGuard } from '../subscription/FeatureGuard';
import { Cloud, Shield, Lightbulb, Copy } from 'lucide-react';


export function IntegrationsDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrations & AI</h1>
        <p className="text-muted-foreground">
          Connect external services and leverage AI-powered features
        </p>
      </div>

      <Tabs defaultValue="cloud" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Cloud Storage
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cloud">
          <FeatureGuard 
            feature="cloud_sync" 
            featureName="Cloud Storage" 
            requiredTier="Pro"
          >
            <CloudStorageManager />
          </FeatureGuard>
        </TabsContent>


        <TabsContent value="insurance">
          <InsuranceManager />
        </TabsContent>

        <TabsContent value="recommendations">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="duplicates">
          <DuplicateDetector />
        </TabsContent>
      </Tabs>
    </div>
  );
}
