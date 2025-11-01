import React from 'react';
import { Download, X, Smartphone, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp, notificationPermission, requestNotificationPermission } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (isInstalled || dismissed || !isInstallable) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl z-50 animate-in slide-in-from-bottom-2">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="bg-white/20 rounded-lg p-2">
          <Smartphone className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Install App</h3>
          <p className="text-white/90 text-sm mb-3">
            Install for offline access, faster loading, and push notifications
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={installApp}
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-1" />
              Install Now
            </Button>
            
            {notificationPermission !== 'granted' && (
              <Button
                onClick={requestNotificationPermission}
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Bell className="h-4 w-4 mr-1" />
                Enable Alerts
              </Button>
            )}
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="flex items-center text-xs text-white/80">
              <CheckCircle className="h-3 w-3 mr-1" />
              Works offline
            </div>
            <div className="flex items-center text-xs text-white/80">
              <CheckCircle className="h-3 w-3 mr-1" />
              Low stock alerts
            </div>
            <div className="flex items-center text-xs text-white/80">
              <CheckCircle className="h-3 w-3 mr-1" />
              Faster scanning
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}