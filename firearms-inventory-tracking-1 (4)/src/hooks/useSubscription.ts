import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTierLimits, canAccessFeature, getItemLimit, getLocationLimit, getUserLimit } from '@/lib/featureGating';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  planType: string | null;
  itemCount: number;
  itemLimit: number;
  locationCount: number;
  locationLimit: number;
  userCount: number;
  userLimit: number;
  expiresAt: string | null;
  canPerformAction: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrial: true,
    planType: null,
    itemCount: 0,
    itemLimit: 50,
    locationCount: 0,
    locationLimit: 1,
    userCount: 1,
    userLimit: 1,
    expiresAt: null,
    canPerformAction: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // Check subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const planType = subscription?.status === 'active' ? subscription.plan_type : 'free';
      
      // Get tier limits from database
      const itemLimit = await getItemLimit(planType);
      const locationLimit = await getLocationLimit(planType);
      const userLimit = await getUserLimit(planType);

      // Count current usage
      const itemCount = await getItemCount();
      const locationCount = await getLocationCount();
      const userCount = await getUserCount();

      setStatus({
        isActive: subscription?.status === 'active',
        isTrial: !subscription || subscription.status !== 'active',
        planType,
        itemCount,
        itemLimit,
        locationCount,
        locationLimit,
        userCount,
        userLimit,
        expiresAt: subscription?.current_period_end || null,
        canPerformAction: itemCount < itemLimit,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemCount = async () => {
    try {
      const { count } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      return count || 0;
    } catch (error) {
      console.error('Error counting items:', error);
      return 0;
    }
  };

  const getLocationCount = async () => {
    try {
      const { count } = await supabase
        .from('storage_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      return count || 0;
    } catch (error) {
      console.error('Error counting locations:', error);
      return 0;
    }
  };

  const getUserCount = async () => {
    try {
      // Count active team members
      const { count: memberCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user?.id);
      
      // Count pending invitations
      const { count: pendingCount } = await supabase
        .from('team_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      return (memberCount || 1) + (pendingCount || 0);
    } catch (error) {
      return 1;
    }
  };


  const canAddItem = () => {
    return status.itemCount < status.itemLimit;
  };

  const canAddLocation = () => {
    return status.locationCount < status.locationLimit;
  };

  const canInviteUser = () => {
    return status.userCount < status.userLimit;
  };

  const hasFeature = async (featureName: string) => {
    return await canAccessFeature(status.planType, `feature_${featureName}` as any);
  };

  const getRemainingItems = () => {
    return Math.max(0, status.itemLimit - status.itemCount);
  };

  const getRemainingLocations = () => {
    return Math.max(0, status.locationLimit - status.locationCount);
  };

  const getRemainingUsers = () => {
    return Math.max(0, status.userLimit - status.userCount);
  };

  return {
    ...status,
    loading,
    refresh: checkSubscriptionStatus,
    canAddItem,
    canAddLocation,
    canInviteUser,
    hasFeature,
    getRemainingItems,
    getRemainingLocations,
    getRemainingUsers,
  };
}

