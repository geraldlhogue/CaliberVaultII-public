import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function UsageStatsCard() {
  const subscription = useSubscription();
  const navigate = useNavigate();

  if (subscription.loading) {
    return null;
  }

  const itemPercent = (subscription.itemCount / subscription.itemLimit) * 100;
  const locationPercent = (subscription.locationCount / subscription.locationLimit) * 100;
  const userPercent = (subscription.userCount / subscription.userLimit) * 100;

  const isNearLimit = itemPercent > 80 || locationPercent > 80 || userPercent > 80;

  return (
    <Card className={isNearLimit ? 'border-orange-500' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Usage & Limits</CardTitle>
          <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
            {subscription.planType || 'Free'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Items</span>
            </div>
            <span className="font-medium">
              {subscription.itemCount} / {subscription.itemLimit}
            </span>
          </div>
          <Progress value={itemPercent} className="h-2" />
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Locations</span>
            </div>
            <span className="font-medium">
              {subscription.locationCount} / {subscription.locationLimit}
            </span>
          </div>
          <Progress value={locationPercent} className="h-2" />
        </div>

        {/* Users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Team Members</span>
            </div>
            <span className="font-medium">
              {subscription.userCount} / {subscription.userLimit}
            </span>
          </div>
          <Progress value={userPercent} className="h-2" />
        </div>

        {/* Upgrade CTA */}
        {!subscription.isActive && (
          <Button 
            onClick={() => navigate('/pricing')} 
            className="w-full mt-2"
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
