import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateStats {
  id: string;
  name: string;
  category: string;
  usage_count: number;
  is_active: boolean;
  auto_resolve: boolean;
  created_at: string;
  last_used?: string;
  avg_resolution_time?: number;
  effectiveness_score?: number;
}

export function TemplateAnalyticsDashboard() {
  const [templates, setTemplates] = useState<TemplateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadTemplateAnalytics();
  }, [timeRange]);

  const loadTemplateAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date filter
      let dateFilter = '';
      if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        const date = new Date();
        date.setDate(date.getDate() - days);
        dateFilter = date.toISOString();
      }

      // Fetch templates with usage stats
      const { data: templatesData, error } = await supabase
        .from('feedback_response_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;

      // Calculate effectiveness metrics for each template
      const enrichedTemplates = await Promise.all(
        (templatesData || []).map(async (template) => {
          // Get responses using this template
          let query = supabase
            .from('feedback_responses')
            .select('id, created_at, feedback_id')
            .eq('template_id', template.id);

          if (dateFilter) {
            query = query.gte('created_at', dateFilter);
          }

          const { data: responses } = await query;

          // Calculate last used
          const lastUsed = responses?.[0]?.created_at;

          // Calculate average resolution time if auto-resolve
          let avgResolutionTime;
          if (template.auto_resolve && responses?.length) {
            const feedbackIds = responses.map(r => r.feedback_id);
            const { data: feedbackData } = await supabase
              .from('onboarding_feedback')
              .select('created_at, resolved_at')
              .in('id', feedbackIds)
              .not('resolved_at', 'is', null);

            if (feedbackData?.length) {
              const totalTime = feedbackData.reduce((sum, fb) => {
                const created = new Date(fb.created_at).getTime();
                const resolved = new Date(fb.resolved_at).getTime();
                return sum + (resolved - created);
              }, 0);
              avgResolutionTime = totalTime / feedbackData.length / (1000 * 60 * 60); // hours
            }
          }

          // Calculate effectiveness score (0-100)
          let effectivenessScore = 50; // baseline
          if (template.usage_count > 0) effectivenessScore += 20;
          if (template.usage_count > 10) effectivenessScore += 10;
          if (template.auto_resolve) effectivenessScore += 10;
          if (avgResolutionTime && avgResolutionTime < 24) effectivenessScore += 10;

          return {
            ...template,
            last_used: lastUsed,
            avg_resolution_time: avgResolutionTime,
            effectiveness_score: Math.min(effectivenessScore, 100)
          };
        })
      );

      setTemplates(enrichedTemplates);
    } catch (error) {
      console.error('Error loading template analytics:', error);
      toast.error('Failed to load template analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalUsage = templates.reduce((sum, t) => sum + t.usage_count, 0);
  const activeTemplates = templates.filter(t => t.is_active).length;
  const avgEffectiveness = templates.length > 0
    ? templates.reduce((sum, t) => sum + (t.effectiveness_score || 0), 0) / templates.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Analytics</h2>
          <p className="text-muted-foreground">Performance insights for response templates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadTemplateAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Template applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTemplates}</div>
            <p className="text-xs text-muted-foreground">Of {templates.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Effectiveness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEffectiveness.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auto-Resolve Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0 
                ? ((templates.filter(t => t.auto_resolve).length / templates.length) * 100).toFixed(0)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Templates with auto-resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No templates found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Template</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-center py-3 px-4">Usage</th>
                    <th className="text-center py-3 px-4">Effectiveness</th>
                    <th className="text-center py-3 px-4">Avg Resolution</th>
                    <th className="text-center py-3 px-4">Last Used</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{template.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{template.category}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold">{template.usage_count}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${template.effectiveness_score}%` }}
                            />
                          </div>
                          <span className="text-sm">{template.effectiveness_score?.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        {template.avg_resolution_time ? (
                          <span className="text-sm">
                            {template.avg_resolution_time.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {template.last_used ? (
                          <span className="text-sm">
                            {new Date(template.last_used).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {template.is_active ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}