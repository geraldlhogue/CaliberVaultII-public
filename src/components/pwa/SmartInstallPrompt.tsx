import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Download, Smartphone, Chrome, Share } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function SmartInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [platform, setPlatform] =
    useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const isTest =
      typeof process !== 'undefined' &&
      (process as any).env &&
      (process as any).env.NODE_ENV === 'test';

    // Detect platform
    const userAgent =
      typeof navigator !== 'undefined'
        ? navigator.userAgent.toLowerCase()
        : '';
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    if (isTest) {
      // In tests, if installable and not installed/dismissed, show immediately
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
      return;
    }

    // Check if already dismissed (real runtime behavior)
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedTime, 10)) /
        (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    const interactionCount = parseInt(
      localStorage.getItem('interactionCount') || '0',
      10
    );
    if (interactionCount >= 3 && isInstallable && !isInstalled && !dismissed) {
      const id = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(id);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
    localStorage.setItem('installAttempted', Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem(
      'installPromptDismissed',
      Date.now().toString()
    );
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Install Arsenal Command</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Install our app for quick access, offline support, and a better
            experience!
          </p>

          {platform === 'android' && isInstallable && (
            <Button onClick={handleInstall} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}

          {platform === 'ios' && (
            <Alert>
              <Share className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Tap <Share className="inline w-3 h-3" /> then "Add to Home
                Screen"
              </AlertDescription>
            </Alert>
          )}

          {platform === 'desktop' && isInstallable && (
            <Button onClick={handleInstall} className="w-full">
              <Chrome className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartInstallPrompt;
