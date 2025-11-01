import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, Zap, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  requireFeature?: string;
}

export function SubscriptionGuard({ children, feature, requireFeature }: SubscriptionGuardProps) {
  const subscription = useSubscription();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (requireFeature) {
      subscription.hasFeature(requireFeature).then(setHasAccess);
    } else {
      setHasAccess(true);
    }
  }, [requireFeature, subscription.planType]);

  if (subscription.loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check feature access
  if (requireFeature && !hasAccess) {
    return (
      <Card className="border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Lock className="h-5 w-5" />
            Premium Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium">Upgrade Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                {feature || 'This feature'} is only available on paid plans.
                Upgrade to unlock this and other premium features.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/pricing')} 
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check item limit
  if (!subscription.canPerformAction) {
    const usagePercent = (subscription.itemCount / subscription.itemLimit) * 100;

    return (
      <Card className="border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Lock className="h-5 w-5" />
            Item Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium">You've reached your item limit</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have {subscription.itemCount} of {subscription.itemLimit} items.
                Upgrade to add more items to your inventory.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Items Used</span>
              <span>{subscription.itemCount} / {subscription.itemLimit}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/pricing')} 
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
