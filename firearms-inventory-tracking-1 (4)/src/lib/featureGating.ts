import { supabase } from './supabase';

export interface TierLimits {
  tier_name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_items: number;
  max_locations: number;
  max_users: number;
  feature_barcode_scanning: boolean;
  feature_ai_valuation: boolean;
  feature_advanced_analytics: boolean;
  feature_cloud_sync: boolean;
  feature_team_collaboration: boolean;
  feature_api_access: boolean;
  feature_white_label: boolean;
  feature_pdf_reports: boolean;
  feature_csv_export: boolean;
  feature_bulk_import: boolean;
  feature_email_notifications: boolean;
  support_level: string;
  description: string;
}

let tierLimitsCache: Record<string, TierLimits> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTierLimits(tierName: string): Promise<TierLimits | null> {
  // Check cache
  const now = Date.now();
  if (tierLimitsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return tierLimitsCache[tierName] || null;
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('tier_limits')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching tier limits:', error);
    return null;
  }

  // Update cache
  tierLimitsCache = {};
  data?.forEach((tier: any) => {
    tierLimitsCache![tier.tier_name] = tier;
  });
  cacheTimestamp = now;

  return tierLimitsCache[tierName] || null;
}

export async function getAllTierLimits(): Promise<TierLimits[]> {
  const { data, error } = await supabase
    .from('tier_limits')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching all tier limits:', error);
    return [];
  }

  return data || [];
}

export function clearTierLimitsCache() {
  tierLimitsCache = null;
  cacheTimestamp = 0;
}

export async function canAccessFeature(
  tierName: string | null,
  featureName: keyof TierLimits
): Promise<boolean> {
  if (!tierName) tierName = 'free';
  
  const limits = await getTierLimits(tierName);
  if (!limits) return false;

  return limits[featureName] === true;
}

export async function getItemLimit(tierName: string | null): Promise<number> {
  if (!tierName) tierName = 'free';
  
  const limits = await getTierLimits(tierName);
  return limits?.max_items || 50;
}

export async function getLocationLimit(tierName: string | null): Promise<number> {
  if (!tierName) tierName = 'free';
  
  const limits = await getTierLimits(tierName);
  return limits?.max_locations || 1;
}

export async function getUserLimit(tierName: string | null): Promise<number> {
  if (!tierName) tierName = 'free';
  
  const limits = await getTierLimits(tierName);
  return limits?.max_users || 1;
}
