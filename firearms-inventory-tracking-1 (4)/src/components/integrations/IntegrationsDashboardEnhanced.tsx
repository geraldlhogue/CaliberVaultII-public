import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Shield, Sparkles, Copy } from 'lucide-react';
import { EnhancedCloudStorageManager } from './EnhancedCloudStorageManager';
import { InsuranceManager } from './InsuranceManager';
import { SmartRecommendations } from '@/components/ai/SmartRecommendations';
import { DuplicateDetector } from '@/components/ai/DuplicateDetector';
import { FeatureGuard } from '../subscription/FeatureGuard';


export function IntegrationsDashboardEnhanced() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Integrations & AI</h1>
        <p className="text-muted-foreground">
          Connect cloud storage, manage insurance, and leverage AI-powered features
        </p>
      </div>

      <Tabs defaultValue="cloud" className="w-full">
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
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cloud" className="mt-6">
          <FeatureGuard 
            feature="cloud_sync" 
            featureName="Cloud Storage" 
            requiredTier="Pro"
          >
            <EnhancedCloudStorageManager />
          </FeatureGuard>
        </TabsContent>


        <TabsContent value="insurance" className="mt-6">
          <InsuranceManager />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="duplicates" className="mt-6">
          <DuplicateDetector />
        </TabsContent>
      </Tabs>
    </div>
  );
}
