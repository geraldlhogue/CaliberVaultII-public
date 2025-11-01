import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Zap, Crown } from 'lucide-react';
import { PricingPlans } from './PricingPlans';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function SubscriptionBanner() {
  const subscription = useSubscription();
  const [showPricing, setShowPricing] = useState(false);

  // Hide banner completely - user doesn't need to see it
  // They can access pricing from settings if needed
  if (subscription.loading || subscription.isActive) {
    return null;
  }

  const usagePercent = (subscription.transactionCount / subscription.transactionLimit) * 100;
  const isNearLimit = usagePercent >= 80;

  // Only show if near limit
  if (!isNearLimit) {
    return null;
  }

  return (
    <>
      <Alert className="border-orange-500 bg-orange-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <AlertDescription className="text-sm">
                <strong>Trial Limit:</strong> {subscription.transactionCount} of {subscription.transactionLimit} transactions used
                <Progress value={usagePercent} className="h-1.5 mt-2" />
              </AlertDescription>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setShowPricing(true)}
            variant="default"
          >
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </div>
      </Alert>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
          </DialogHeader>
          <PricingPlans />
        </DialogContent>
      </Dialog>
    </>
  );
}

