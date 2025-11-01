import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, DollarSign, Users, Package, MapPin } from 'lucide-react';
import { clearTierLimitsCache } from '@/lib/featureGating';

interface TierLimit {
  id: string;
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

export function TierLimitsManager() {
  const [tiers, setTiers] = useState<TierLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('tier_limits')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error loading tiers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tier limits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTier = async (tier: TierLimit) => {
    try {
      setSaving(tier.id);
      const { error } = await supabase
        .from('tier_limits')
        .update(tier)
        .eq('id', tier.id);

      if (error) throw error;

      clearTierLimitsCache();
      toast({
        title: 'Success',
        description: `${tier.display_name} tier updated successfully`,
      });
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tier',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (tierId: string, field: string, value: any) => {
    setTiers(prev => prev.map(t => 
      t.id === tierId ? { ...t, [field]: value } : t
    ));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tier Limits Configuration</h2>
        <p className="text-muted-foreground">
          Configure subscription tier limits and features. Changes apply immediately to all users.
        </p>
      </div>

      <div className="grid gap-6">
        {tiers.map(tier => (
          <Card key={tier.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tier.display_name} Tier</span>
                <Button
                  onClick={() => updateTier(tier)}
                  disabled={saving === tier.id}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === tier.id ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`${tier.id}-monthly`}>
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Monthly Price
                  </Label>
                  <Input
                    id={`${tier.id}-monthly`}
                    type="number"
                    step="0.01"
                    value={tier.price_monthly}
                    onChange={(e) => handleChange(tier.id, 'price_monthly', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`${tier.id}-yearly`}>
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Yearly Price
                  </Label>
                  <Input
                    id={`${tier.id}-yearly`}
                    type="number"
                    step="0.01"
                    value={tier.price_yearly}
                    onChange={(e) => handleChange(tier.id, 'price_yearly', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`${tier.id}-items`}>
                    <Package className="h-4 w-4 inline mr-1" />
                    Max Items
                  </Label>
                  <Input
                    id={`${tier.id}-items`}
                    type="number"
                    value={tier.max_items}
                    onChange={(e) => handleChange(tier.id, 'max_items', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`${tier.id}-locations`}>
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Max Locations
                  </Label>
                  <Input
                    id={`${tier.id}-locations`}
                    type="number"
                    value={tier.max_locations}
                    onChange={(e) => handleChange(tier.id, 'max_locations', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`${tier.id}-users`}>
                    <Users className="h-4 w-4 inline mr-1" />
                    Max Users
                  </Label>
                  <Input
                    id={`${tier.id}-users`}
                    type="number"
                    value={tier.max_users}
                    onChange={(e) => handleChange(tier.id, 'max_users', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold">Features</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'feature_barcode_scanning', label: 'Barcode Scanning' },
                    { key: 'feature_ai_valuation', label: 'AI Valuation' },
                    { key: 'feature_advanced_analytics', label: 'Advanced Analytics' },
                    { key: 'feature_cloud_sync', label: 'Cloud Sync' },
                    { key: 'feature_team_collaboration', label: 'Team Collaboration' },
                    { key: 'feature_api_access', label: 'API Access' },
                    { key: 'feature_white_label', label: 'White Label' },
                    { key: 'feature_pdf_reports', label: 'PDF Reports' },
                    { key: 'feature_csv_export', label: 'CSV Export' },
                    { key: 'feature_bulk_import', label: 'Bulk Import' },
                    { key: 'feature_email_notifications', label: 'Email Notifications' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`${tier.id}-${key}`}>{label}</Label>
                      <Switch
                        id={`${tier.id}-${key}`}
                        checked={tier[key as keyof TierLimit] as boolean}
                        onCheckedChange={(checked) => handleChange(tier.id, key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
