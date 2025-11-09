import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  user_id: string;
  action_type: string;
  item_type: string;
  item_id: string;
  item_name: string;
  details: any;
  created_at: string;
  user_email?: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    
    const channel = supabase
      .channel('activity_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_feed' }, () => {
        loadActivities();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'deleted': return <Trash2 className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'default';
      case 'updated': return 'secondary';
      case 'deleted': return 'destructive';
      case 'viewed': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant={getActionColor(activity.action_type)}>
                  {getActionIcon(activity.action_type)}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.action_type} {activity.item_type}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.item_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
