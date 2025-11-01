import React, { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface FeatureGuardProps {
  children: React.ReactNode;
  feature: string;
  featureName?: string;
  requiredTier?: string;
}

export function FeatureGuard({ 
  children, 
  feature, 
  featureName,
  requiredTier = 'Pro' 
}: FeatureGuardProps) {
  const subscription = useSubscription();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    subscription.hasFeature(feature).then(setHasAccess);
  }, [feature, subscription.planType]);

  if (subscription.loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            <span>{featureName || 'Premium Feature'}</span>
            <Badge variant="outline" className="ml-auto">{requiredTier}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This feature requires a {requiredTier} subscription or higher.
          </p>
          <Button 
            onClick={() => navigate('/pricing')} 
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to {requiredTier}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
