import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { PWAAnalyticsService } from '@/services/analytics/PWAAnalyticsService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function EnhancedInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [variant, setVariant] = useState<any>(null);
  const [timeOnSite, setTimeOnSite] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      loadVariantAndShow();
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Track time on site
    const timer = setInterval(() => {
      setTimeOnSite(prev => prev + 1);
      PWAAnalyticsService.trackAction();
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(timer);
    };
  }, []);

  const loadVariantAndShow = async () => {
    const testVariant = await PWAAnalyticsService.getABTestVariant();
    setVariant(testVariant);

    if (testVariant) {
      // Check timing threshold
      if (testVariant.prompt_timing === 'immediate') {
        showPromptWithTracking(testVariant);
      } else if (testVariant.prompt_timing === 'after_engagement') {
        setTimeout(() => showPromptWithTracking(testVariant), testVariant.timing_threshold * 1000);
      } else if (testVariant.prompt_timing === 'after_value') {
        // Show after user performs X actions
        const checkActions = setInterval(() => {
          if (timeOnSite >= testVariant.timing_threshold) {
            showPromptWithTracking(testVariant);
            clearInterval(checkActions);
          }
        }, 1000);
      }
    }
  };

  const showPromptWithTracking = (testVariant: any) => {
    setShowPrompt(true);
    PWAAnalyticsService.trackInstallEvent({
      eventType: 'prompt_shown',
      promptVariant: testVariant.variant_name,
      promptTiming: testVariant.prompt_timing
    });
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    PWAAnalyticsService.trackInstallEvent({
      eventType: 'prompt_accepted',
      promptVariant: variant?.variant_name,
      promptTiming: variant?.prompt_timing
    });

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      PWAAnalyticsService.trackInstallEvent({
        eventType: 'installed',
        promptVariant: variant?.variant_name,
        promptTiming: variant?.prompt_timing
      });
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    PWAAnalyticsService.trackInstallEvent({
      eventType: 'prompt_dismissed',
      promptVariant: variant?.variant_name,
      promptTiming: variant?.prompt_timing
    });
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt || !variant) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-gradient-to-br from-background to-muted">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{variant.prompt_title}</h3>
            <p className="text-sm text-muted-foreground">{variant.prompt_message}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button onClick={handleDismiss} variant="outline">
            Not Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
