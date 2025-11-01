import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Users, Activity, Eye } from 'lucide-react';

interface UserPresence {
  user_id: string;
  email: string;
  last_seen: string;
  current_page: string;
}

export function RealtimeCollaboration() {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadActiveUsers();
    loadRecentActivity();

    // Subscribe to presence updates
    const presenceChannel = supabase
      .channel('user-presence')
      .on('presence', { event: 'sync' }, () => {
        loadActiveUsers();
      })
      .subscribe();

    // Subscribe to activity feed
    const activityChannel = supabase
      .channel('activity-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'activity_feed' 
      }, () => {
        loadRecentActivity();
      })
      .subscribe();

    // Update own presence
    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000);

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(activityChannel);
      clearInterval(presenceInterval);
    };
  }, []);

  const updatePresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        last_seen: new Date().toISOString(),
        current_page: window.location.pathname
      });
  };

  const loadActiveUsers = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data } = await supabase
      .from('user_presence')
      .select('*')
      .gte('last_seen', fiveMinutesAgo);

    if (data) setActiveUsers(data);
  };

  const loadRecentActivity = async () => {
    const { data } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setRecentActivity(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Team Members
            <Badge variant="secondary">{activeUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active users</p>
            ) : (
              activeUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {user.current_page}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
