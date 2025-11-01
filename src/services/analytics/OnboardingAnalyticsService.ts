import { supabase } from '@/lib/supabase';

export interface OnboardingMetrics {
  totalInvitations: number;
  acceptanceRate: number;
  onboardingCompletionRate: number;
  averageCompletionTime: number;
  stepDropOffRates: Record<string, number>;
  commonExitPoints: Array<{ step: string; count: number }>;
  feedbackMetrics?: {
    averageRatings: Record<string, number>;
    totalFeedback: number;
    sentimentScore: number;
  };
}

export interface FeedbackData {
  stepName: string;
  rating: number;
  comments: string;
  createdAt: string;
}


export interface OnboardingTrend {
  date: string;
  invitations: number;
  acceptances: number;
  completions: number;
}

export interface TeamComparison {
  teamId: string;
  teamName: string;
  completionRate: number;
  averageTime: number;
}

export class OnboardingAnalyticsService {
  static async getMetrics(filters: {
    startDate?: string;
    endDate?: string;
    teamId?: string;
    role?: string;
  }): Promise<OnboardingMetrics> {
    const { data: invitations } = await supabase
      .from('team_invitations')
      .select('*')
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31');

    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31');

    const totalInvitations = invitations?.length || 0;
    const acceptedInvitations = members?.length || 0;
    const completedOnboarding = members?.filter(m => m.onboarding_completed).length || 0;

    const completionTimes = members
      ?.filter(m => m.onboarding_completed_at && m.onboarding_started_at)
      .map(m => {
        const start = new Date(m.onboarding_started_at).getTime();
        const end = new Date(m.onboarding_completed_at).getTime();
        return (end - start) / (1000 * 60); // minutes
      }) || [];

    const avgTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    const feedbackMetrics = await this.getFeedbackMetrics(filters);

    return {
      totalInvitations,
      acceptanceRate: totalInvitations > 0 ? (acceptedInvitations / totalInvitations) * 100 : 0,
      onboardingCompletionRate: acceptedInvitations > 0 ? (completedOnboarding / acceptedInvitations) * 100 : 0,
      averageCompletionTime: avgTime,
      stepDropOffRates: this.calculateStepDropOff(members || []),
      commonExitPoints: this.calculateExitPoints(members || []),
      feedbackMetrics
    };
  }

  private static async getFeedbackMetrics(filters: any) {
    const { data: feedback } = await supabase
      .from('onboarding_feedback')
      .select('*')
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31');

    if (!feedback || feedback.length === 0) {
      return {
        averageRatings: {},
        totalFeedback: 0,
        sentimentScore: 0
      };
    }

    const steps = ['welcome', 'role', 'features', 'tips'];
    const averageRatings: Record<string, number> = {};

    steps.forEach(step => {
      const stepFeedback = feedback.filter(f => f.step_name === step);
      if (stepFeedback.length > 0) {
        const avgRating = stepFeedback.reduce((sum, f) => sum + f.rating, 0) / stepFeedback.length;
        averageRatings[step] = avgRating;
      }
    });

    const sentimentScore = this.calculateSentiment(feedback.map(f => f.comments).filter(Boolean));

    return {
      averageRatings,
      totalFeedback: feedback.length,
      sentimentScore
    };
  }

  private static calculateSentiment(comments: string[]): number {
    const positiveWords = ['great', 'excellent', 'good', 'helpful', 'clear', 'easy', 'love', 'perfect', 'awesome'];
    const negativeWords = ['bad', 'poor', 'confusing', 'difficult', 'hard', 'unclear', 'hate', 'terrible', 'awful'];

    let score = 0;
    comments.forEach(comment => {
      const lower = comment.toLowerCase();
      positiveWords.forEach(word => {
        if (lower.includes(word)) score += 1;
      });
      negativeWords.forEach(word => {
        if (lower.includes(word)) score -= 1;
      });
    });

    return comments.length > 0 ? (score / comments.length) * 10 : 0;
  }


  private static calculateStepDropOff(members: any[]): Record<string, number> {
    const steps = ['welcome', 'role', 'features', 'tips'];
    const dropOff: Record<string, number> = {};
    
    steps.forEach(step => {
      const reachedStep = members.filter(m => 
        m.onboarding_progress?.completedSteps?.includes(step) || 
        m.onboarding_progress?.currentStep === step
      ).length;
      dropOff[step] = members.length > 0 ? ((members.length - reachedStep) / members.length) * 100 : 0;
    });

    return dropOff;
  }

  private static calculateExitPoints(members: any[]): Array<{ step: string; count: number }> {
    const exitCounts: Record<string, number> = {};
    
    members.filter(m => !m.onboarding_completed).forEach(m => {
      const currentStep = m.onboarding_progress?.currentStep || 'welcome';
      exitCounts[currentStep] = (exitCounts[currentStep] || 0) + 1;
    });

    return Object.entries(exitCounts)
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);
  }

  static async getTrends(days: number = 30): Promise<OnboardingTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: invitations } = await supabase
      .from('team_invitations')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString());

    const { data: members } = await supabase
      .from('team_members')
      .select('created_at, onboarding_completed')
      .gte('created_at', startDate.toISOString());

    const trendMap: Record<string, OnboardingTrend> = {};

    invitations?.forEach(inv => {
      const date = inv.created_at.split('T')[0];
      if (!trendMap[date]) {
        trendMap[date] = { date, invitations: 0, acceptances: 0, completions: 0 };
      }
      trendMap[date].invitations++;
    });

    members?.forEach(mem => {
      const date = mem.created_at.split('T')[0];
      if (!trendMap[date]) {
        trendMap[date] = { date, invitations: 0, acceptances: 0, completions: 0 };
      }
      trendMap[date].acceptances++;
      if (mem.onboarding_completed) {
        trendMap[date].completions++;
      }
    });

    return Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getTeamComparisons(): Promise<TeamComparison[]> {
    const { data: teams } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        team_members (
          onboarding_completed,
          onboarding_started_at,
          onboarding_completed_at
        )
      `);

    return teams?.map(team => {
      const members = team.team_members || [];
      const completed = members.filter((m: any) => m.onboarding_completed).length;
      const completionRate = members.length > 0 ? (completed / members.length) * 100 : 0;

      const times = members
        .filter((m: any) => m.onboarding_completed_at && m.onboarding_started_at)
        .map((m: any) => {
          const start = new Date(m.onboarding_started_at).getTime();
          const end = new Date(m.onboarding_completed_at).getTime();
          return (end - start) / (1000 * 60);
        });

      const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

      return {
        teamId: team.id,
        teamName: team.name,
        completionRate,
        averageTime
      };
    }) || [];
  }

  static async sendOnboardingReminders(): Promise<number> {
    const { data: incompleteMembers } = await supabase
      .from('team_members')
      .select(`
        *,
        user_profiles (email, full_name),
        teams (name)
      `)
      .eq('onboarding_completed', false)
      .not('onboarding_started_at', 'is', null);

    let sentCount = 0;

    for (const member of incompleteMembers || []) {
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            to: member.user_profiles.email,
            subject: `Complete your onboarding for ${member.teams.name}`,
            template: 'onboarding_reminder',
            data: {
              userName: member.user_profiles.full_name,
              teamName: member.teams.name,
              onboardingUrl: `${window.location.origin}/onboarding`
            }
          }
        });
        sentCount++;
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }

    return sentCount;
  }

  static async exportOnboardingData(filters: any): Promise<string> {
    const { data } = await supabase
      .from('team_members')
      .select(`
        *,
        user_profiles (email, full_name),
        teams (name)
      `)
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31');

    const csv = [
      ['Team', 'Member', 'Email', 'Role', 'Invited At', 'Started At', 'Completed At', 'Status', 'Current Step'].join(','),
      ...(data || []).map(m => [
        m.teams?.name || '',
        m.user_profiles?.full_name || '',
        m.user_profiles?.email || '',
        m.role,
        m.created_at,
        m.onboarding_started_at || '',
        m.onboarding_completed_at || '',
        m.onboarding_completed ? 'Completed' : 'In Progress',
        m.onboarding_progress?.currentStep || ''
      ].join(','))
    ].join('\n');

    return csv;
  }

  static async getFeedbackByStep(stepName: string): Promise<FeedbackData[]> {
    const { data } = await supabase
      .from('onboarding_feedback')
      .select('*')
      .eq('step_name', stepName)
      .order('created_at', { ascending: false });

    return data?.map(f => ({
      stepName: f.step_name,
      rating: f.rating,
      comments: f.comments || '',
      createdAt: f.created_at
    })) || [];
  }

  static async getAllFeedback(filters: any): Promise<FeedbackData[]> {
    const { data } = await supabase
      .from('onboarding_feedback')
      .select('*')
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31')
      .order('created_at', { ascending: false });

    return data?.map(f => ({
      stepName: f.step_name,
      rating: f.rating,
      comments: f.comments || '',
      createdAt: f.created_at
    })) || [];
  }

  static async getFeedbackWithResponses(filters: any) {
    const { data } = await supabase
      .from('onboarding_feedback')
      .select(`
        *,
        team_member:team_member_id (
          user_profiles (email, full_name)
        ),
        feedback_responses (
          id,
          response_text,
          template_used,
          is_resolved,
          created_at,
          admin:admin_id (
            email,
            user_profiles (full_name)
          )
        )
      `)
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31')
      .order('created_at', { ascending: false });

    return data || [];
  }

  static async getResponseMetrics(filters: any) {
    const { data: responses } = await supabase
      .from('feedback_responses')
      .select(`
        *,
        onboarding_feedback!inner (created_at)
      `)
      .gte('onboarding_feedback.created_at', filters.startDate || '2000-01-01')
      .lte('onboarding_feedback.created_at', filters.endDate || '2099-12-31');

    if (!responses || responses.length === 0) {
      return {
        totalResponses: 0,
        averageResponseTime: 0,
        resolvedCount: 0,
        resolutionRate: 0
      };
    }

    const responseTimes = responses
      .filter(r => r.onboarding_feedback?.created_at)
      .map(r => {
        const feedbackTime = new Date(r.onboarding_feedback.created_at).getTime();
        const responseTime = new Date(r.created_at).getTime();
        return (responseTime - feedbackTime) / (1000 * 60 * 60); // hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const resolvedCount = responses.filter(r => r.is_resolved).length;

    return {
      totalResponses: responses.length,
      averageResponseTime: avgResponseTime,
      resolvedCount,
      resolutionRate: (resolvedCount / responses.length) * 100
    };
  }

  static async submitFeedbackResponse(
    feedbackId: string,
    responseText: string,
    isResolved: boolean,
    templateUsed?: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('feedback_responses')
      .insert({
        feedback_id: feedbackId,
        admin_id: user.id,
        response_text: responseText,
        template_used: templateUsed,
        is_resolved: isResolved
      });

    if (error) throw error;
  }



  static async submitBulkFeedbackResponses(
    feedbackIds: string[],
    responseText: string,
    isResolved: boolean,
    templateUsed?: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const responses = feedbackIds.map(feedbackId => ({
      feedback_id: feedbackId,
      admin_id: user.id,
      response_text: responseText,
      template_used: templateUsed,
      is_resolved: isResolved
    }));

    const { error } = await supabase
      .from('feedback_responses')
      .insert(responses);

    if (error) throw error;

    // Track bulk action
    await this.trackBulkAction('bulk_response', feedbackIds.length);

    return feedbackIds.length;
  }

  static async bulkMarkAsResolved(feedbackIds: string[]) {
    const { error } = await supabase
      .from('onboarding_feedback')
      .update({ is_resolved: true })
      .in('id', feedbackIds);

    if (error) throw error;

    // Track bulk action
    await this.trackBulkAction('bulk_resolve', feedbackIds.length);

    return feedbackIds.length;
  }

  static async bulkArchiveFeedback(feedbackIds: string[]) {
    const { error } = await supabase
      .from('onboarding_feedback')
      .update({ archived: true })
      .in('id', feedbackIds);

    if (error) throw error;

    // Track bulk action
    await this.trackBulkAction('bulk_archive', feedbackIds.length);

    return feedbackIds.length;
  }

  private static async trackBulkAction(actionType: string, itemCount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('admin_bulk_actions')
        .insert({
          admin_id: user.id,
          action_type: actionType,
          item_count: itemCount,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to track bulk action:', error);
    }
  }

  static async getBulkActionMetrics(filters: any) {
    const { data } = await supabase
      .from('admin_bulk_actions')
      .select('*')
      .gte('created_at', filters.startDate || '2000-01-01')
      .lte('created_at', filters.endDate || '2099-12-31');

    if (!data || data.length === 0) {
      return {
        totalBulkActions: 0,
        totalItemsProcessed: 0,
        averageItemsPerAction: 0,
        actionBreakdown: {}
      };
    }

    const totalItemsProcessed = data.reduce((sum, action) => sum + action.item_count, 0);
    const actionBreakdown: Record<string, number> = {};

    data.forEach(action => {
      actionBreakdown[action.action_type] = (actionBreakdown[action.action_type] || 0) + 1;
    });

    return {
      totalBulkActions: data.length,
      totalItemsProcessed,
      averageItemsPerAction: totalItemsProcessed / data.length,
      actionBreakdown
    };
  }
}


