import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingAnalyticsService } from '@/services/analytics/OnboardingAnalyticsService';
import { OnboardingMetricsCards } from './OnboardingMetricsCards';
import { OnboardingTrendsChart } from './OnboardingTrendsChart';
import { OnboardingStepDropOffChart } from './OnboardingStepDropOffChart';
import { OnboardingTeamComparison } from './OnboardingTeamComparison';
import { FeedbackResponseModal } from '@/components/onboarding/FeedbackResponseModal';
import { BulkActionsToolbar } from '@/components/onboarding/BulkActionsToolbar';
import { BulkResponseModal } from '@/components/onboarding/BulkResponseModal';
import { SmartFeedbackGrouping } from '@/components/onboarding/SmartFeedbackGrouping';
import { ScheduledBulkActionsModal } from '@/components/onboarding/ScheduledBulkActionsModal';
import { FeedbackTemplateManager } from '@/components/onboarding/FeedbackTemplateManager';
import { TemplateAnalyticsDashboard } from './TemplateAnalyticsDashboard';
import { AdvancedFeedbackSearch } from '@/components/onboarding/AdvancedFeedbackSearch';


import { Download, Mail, Calendar as CalendarIcon, Star, MessageSquare, CheckCircle, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';


export function OnboardingAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [teamComparisons, setTeamComparisons] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [responseMetrics, setResponseMetrics] = useState<any>(null);
  const [bulkActionMetrics, setBulkActionMetrics] = useState<any>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showBulkResponseModal, setShowBulkResponseModal] = useState(false);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [trendDays, setTrendDays] = useState(30);

  const handleGroupSelect = (feedbackIds: string[]) => {
    setSelectedFeedbackIds(feedbackIds);
    toast.success(`Selected ${feedbackIds.length} feedback items`);
  };



  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedTeam, selectedRole, trendDays]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const filters = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        teamId: selectedTeam !== 'all' ? selectedTeam : undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined
      };

      const [metricsData, trendsData, comparisonsData, feedbackData, respMetrics, bulkMetrics] = await Promise.all([
        OnboardingAnalyticsService.getMetrics(filters),
        OnboardingAnalyticsService.getTrends(trendDays),
        OnboardingAnalyticsService.getTeamComparisons(),
        OnboardingAnalyticsService.getFeedbackWithResponses(filters),
        OnboardingAnalyticsService.getResponseMetrics(filters),
        OnboardingAnalyticsService.getBulkActionMetrics(filters)
      ]);

      setMetrics(metricsData);
      setTrends(trendsData);
      setTeamComparisons(comparisonsData);
      setFeedbackList(feedbackData);
      setResponseMetrics(respMetrics);
      setBulkActionMetrics(bulkMetrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setShowResponseModal(true);
  };

  const handleToggleSelection = (feedbackId: string) => {
    setSelectedFeedbackIds(prev =>
      prev.includes(feedbackId)
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeedbackIds.length === feedbackList.length) {
      setSelectedFeedbackIds([]);
    } else {
      setSelectedFeedbackIds(feedbackList.map(f => f.id));
    }
  };

  const handleBulkRespond = () => {
    setShowBulkResponseModal(true);
  };

  const handleBulkMarkResolved = async () => {
    try {
      await OnboardingAnalyticsService.bulkMarkAsResolved(selectedFeedbackIds);
      toast.success(`Marked ${selectedFeedbackIds.length} items as resolved`);
      setSelectedFeedbackIds([]);
      loadAnalytics();
    } catch (error) {
      toast.error('Failed to mark items as resolved');
    }
  };

  const handleBulkArchive = async () => {
    try {
      await OnboardingAnalyticsService.bulkArchiveFeedback(selectedFeedbackIds);
      toast.success(`Archived ${selectedFeedbackIds.length} items`);
      setSelectedFeedbackIds([]);
      loadAnalytics();
    } catch (error) {
      toast.error('Failed to archive items');
    }
  };

  const handleBulkResponseSubmit = async (responseText: string, template: string | null, markResolved: boolean) => {
    try {
      await OnboardingAnalyticsService.submitBulkFeedbackResponses(
        selectedFeedbackIds,
        responseText,
        markResolved,
        template || undefined
      );
      toast.success(`Sent responses to ${selectedFeedbackIds.length} team members`);
      setSelectedFeedbackIds([]);
      setShowBulkResponseModal(false);
      loadAnalytics();
    } catch (error) {
      toast.error('Failed to send bulk responses');
    }
  };



  const handleExport = async () => {
    try {
      const csv = await OnboardingAnalyticsService.exportOnboardingData({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };


  const handleSendReminders = async () => {
    try {
      const count = await OnboardingAnalyticsService.sendOnboardingReminders();
      toast.success(`Sent ${count} reminder emails`);
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Analytics</h1>
          <p className="text-muted-foreground">Track team member onboarding progress and completion</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendReminders} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range: any) => range && setDateRange(range)}
            />
          </PopoverContent>
        </Popover>

        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={trendDays.toString()} onValueChange={(v) => setTrendDays(Number(v))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trend Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OnboardingMetricsCards metrics={metrics} />
      <OnboardingTrendsChart trends={trends} />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="grouping">Smart Grouping</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Template Analytics</TabsTrigger>
        </TabsList>



        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OnboardingStepDropOffChart stepDropOff={metrics?.stepDropOffRates || {}} />
            <OnboardingTeamComparison comparisons={teamComparisons} />
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Response Metrics */}
          {responseMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responseMetrics.totalResponses}</div>
                  <p className="text-xs text-muted-foreground mt-1">Admin responses sent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {responseMetrics.averageResponseTime.toFixed(1)}h
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Time to respond</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {responseMetrics.resolvedCount}
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Marked as resolved</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responseMetrics.resolutionRate.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Issues resolved</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback Metrics */}
          {metrics?.feedbackMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.feedbackMetrics.totalFeedback}</div>
                  <p className="text-xs text-muted-foreground mt-1">Responses collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.feedbackMetrics.sentimentScore.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.feedbackMetrics.sentimentScore > 0 ? 'Positive' : 'Negative'} overall
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {Object.values(metrics.feedbackMetrics.averageRatings).length > 0
                      ? (Object.values(metrics.feedbackMetrics.averageRatings).reduce((a: any, b: any) => a + b, 0) / 
                         Object.values(metrics.feedbackMetrics.averageRatings).length).toFixed(1)
                      : 'N/A'}
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all steps</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bulk Action Metrics */}
          {bulkActionMetrics && bulkActionMetrics.totalBulkActions > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Bulk Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bulkActionMetrics.totalBulkActions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total bulk operations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Items Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bulkActionMetrics.totalItemsProcessed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Via bulk actions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Per Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bulkActionMetrics.averageItemsPerAction.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Items per bulk action</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {((bulkActionMetrics.totalItemsProcessed / Math.max(bulkActionMetrics.totalBulkActions, 1) - 1) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Time saved vs individual</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback List with Bulk Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Feedback & Admin Responses</CardTitle>
                  <CardDescription>Select and respond to multiple feedback items at once</CardDescription>
                </div>
                {feedbackList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedFeedbackIds.length === feedbackList.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No feedback collected yet</p>
                ) : (
                  feedbackList.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedFeedbackIds.includes(feedback.id)}
                          onCheckedChange={() => handleToggleSelection(feedback.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">{feedback.step_name}</Badge>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= feedback.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {feedback.has_response && (
                              <Badge variant="secondary" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Responded
                              </Badge>
                            )}
                            {feedback.is_resolved && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{feedback.comments}</p>
                          <p className="text-xs text-muted-foreground">
                            From: {feedback.team_member?.user_profiles?.full_name || 'Unknown'} • 
                            {format(new Date(feedback.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {!feedback.has_response && (
                          <Button
                            size="sm"
                            onClick={() => handleRespondToFeedback(feedback)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        )}
                      </div>

                      {/* Admin Responses */}
                      {feedback.feedback_responses && feedback.feedback_responses.length > 0 && (
                        <div className="ml-10 pl-4 border-l-2 border-primary/20 space-y-2">
                          {feedback.feedback_responses.map((response: any) => (
                            <div key={response.id} className="bg-muted/50 rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">Admin Response</Badge>
                                {response.template_used && (
                                  <span className="text-xs text-muted-foreground">
                                    (Template: {response.template_used})
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{response.response_text}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                By: {response.admin?.user_profiles?.full_name || 'Admin'} • 
                                {format(new Date(response.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grouping" className="space-y-6">
          <SmartFeedbackGrouping 
            feedbackItems={feedbackList}
            onGroupSelect={handleGroupSelect}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <FeedbackTemplateManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <TemplateAnalyticsDashboard />
        </TabsContent>

      </Tabs>


      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedFeedbackIds.length}
        onRespondToSelected={handleBulkRespond}
        onMarkAsResolved={handleBulkMarkResolved}
        onArchive={handleBulkArchive}
        onClearSelection={() => setSelectedFeedbackIds([])}
      />

      {/* Bulk Response Modal */}
      <BulkResponseModal
        isOpen={showBulkResponseModal}
        onClose={() => setShowBulkResponseModal(false)}
        selectedCount={selectedFeedbackIds.length}
        onConfirm={handleBulkResponseSubmit}
      />



      {/* Response Modal */}
      {selectedFeedback && (

        <FeedbackResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedFeedback(null);
          }}
          feedback={selectedFeedback}
          onResponseSent={() => {
            loadAnalytics();
          }}
        />
      )}
    </div>
  );
}
