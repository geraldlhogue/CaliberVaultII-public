import React, { useState } from 'react';
import { Sparkles, Users, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FeedbackGroup {
  groupName: string;
  theme: string;
  feedbackIds: string[];
  severity: 'low' | 'medium' | 'high';
  suggestedResponse: string;
}

interface SmartFeedbackGroupingProps {
  feedbackItems: any[];
  onGroupSelect: (feedbackIds: string[]) => void;
}

export function SmartFeedbackGrouping({ feedbackItems, onGroupSelect }: SmartFeedbackGroupingProps) {
  const [groups, setGroups] = useState<FeedbackGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const analyzeAndGroup = async () => {
    if (feedbackItems.length < 2) {
      toast.error('Need at least 2 feedback items to group');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('group-similar-feedback', {
        body: { feedbackItems }
      });

      if (error) throw error;

      setGroups(data.groups || []);
      toast.success(`Found ${data.groups.length} feedback groups`);
    } catch (error) {
      console.error('Error grouping feedback:', error);
      toast.error('Failed to analyze feedback');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Users className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Smart Feedback Grouping</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis to group similar feedback
          </p>
        </div>
        <Button onClick={analyzeAndGroup} disabled={loading || feedbackItems.length < 2}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Analyzing...' : 'Analyze Feedback'}
        </Button>
      </div>

      {groups.length > 0 && (
        <div className="grid gap-4">
          {groups.map((group, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{group.groupName}</h4>
                    <Badge variant={getSeverityColor(group.severity)}>
                      {getSeverityIcon(group.severity)}
                      <span className="ml-1">{group.severity}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {group.feedbackIds.length} items
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{group.theme}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Suggested Response:</p>
                    <p className="text-sm text-blue-800">{group.suggestedResponse}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onGroupSelect(group.feedbackIds)}
                  className="ml-4"
                >
                  Select Group
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {groups.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Click "Analyze Feedback" to group similar items using AI
          </p>
        </Card>
      )}
    </div>
  );
}
