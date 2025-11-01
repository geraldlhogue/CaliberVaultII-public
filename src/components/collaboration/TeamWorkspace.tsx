import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamManagement } from './TeamManagement';
import { SharedInventory } from './SharedInventory';
import { ActivityFeed } from './ActivityFeed';
import { ItemComments } from './ItemComments';
import { RealtimeCollaboration } from './RealtimeCollaboration';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { Users, Share2, Activity, MessageSquare, Radio } from 'lucide-react';

export function TeamWorkspace() {
  const [activeTab, setActiveTab] = useState('teams');

  return (
    <FeatureGuard feature="team_collaboration" featureName="Team Collaboration" requiredTier="Pro">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Team Workspace</h1>
            <p className="text-slate-400">Collaborate with your team on inventory management</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-700">
              <TabsTrigger value="realtime" className="data-[state=active]:bg-orange-600">
                <Radio className="h-4 w-4 mr-2" />
                Live
              </TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-orange-600">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="shared" className="data-[state=active]:bg-orange-600">
                <Share2 className="h-4 w-4 mr-2" />
                Shared Items
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-orange-600">
                <Activity className="h-4 w-4 mr-2" />
                Activity Feed
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-orange-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="realtime">
              <RealtimeCollaboration />
            </TabsContent>


            <TabsContent value="teams">
              <TeamManagement />
            </TabsContent>

            <TabsContent value="shared">
              <SharedInventory />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityFeed />
            </TabsContent>

            <TabsContent value="comments">
              <ItemComments itemType="firearm" itemId="" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FeatureGuard>
  );
}
