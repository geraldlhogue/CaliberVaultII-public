import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, X, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AppVersion {
  version: string;
  releaseDate: string;
  features: string[];
  fixes?: string[];
}

const CURRENT_VERSION = '2.5.0';
const VERSION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
const VERSION_STORAGE_KEY = 'calibervault_app_version';
const LAST_CHECK_KEY = 'calibervault_last_version_check';
const DISMISSED_VERSION_KEY = 'calibervault_dismissed_version';

// Mock version data - in production, this would come from an API
const versionHistory: AppVersion[] = [
  {
    version: '2.5.0',
    releaseDate: '2025-10-25',
    features: [
      'Face ID/Touch ID authentication support',
      'Enhanced pull-to-refresh with visual feedback',
      'Infinite scrolling for large inventories',
      'Improved mobile navigation with back button support'
    ],
    fixes: [
      'Fixed scrolling issues on mobile devices',
      'Resolved refresh button spinning indefinitely',
      'Fixed navigation getting stuck in all items view'
    ]
  },
  {
    version: '2.4.0',
    releaseDate: '2025-10-20',
    features: [
      'Batch barcode scanning',
      'Enhanced label printing',
      'Offline barcode caching'
    ]
  }
];

export function AppUpdateNotifier() {
  const [showNotification, setShowNotification] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState<AppVersion | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    // Set up periodic checks
    const interval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker installed, update available
                checkForUpdates();
              }
            });
          }
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
      const now = Date.now();
      
      // Throttle checks
      if (lastCheck && now - parseInt(lastCheck) < 60000) {
        return;
      }
      
      localStorage.setItem(LAST_CHECK_KEY, now.toString());
      
      // In production, this would be an API call
      const latestVersion = versionHistory[0];
      const currentStoredVersion = localStorage.getItem(VERSION_STORAGE_KEY) || CURRENT_VERSION;
      const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
      
      if (latestVersion.version !== currentStoredVersion && 
          latestVersion.version !== dismissedVersion) {
        setNewVersion(latestVersion);
        setUpdateAvailable(true);
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('updating');
    
    try {
      // For PWA, we need to reload to get the new version
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for updates
        await registration.update();
        
        // If there's a waiting service worker, activate it
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for the new service worker to take control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        } else {
          // No waiting worker, just reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        
        setUpdateStatus('success');
        localStorage.setItem(VERSION_STORAGE_KEY, newVersion?.version || CURRENT_VERSION);
      } else {
        // For non-PWA, just reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateStatus('error');
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateStatus('idle');
      }, 3000);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    if (newVersion) {
      localStorage.setItem(DISMISSED_VERSION_KEY, newVersion.version);
    }
  };

  if (!showNotification || !updateAvailable || !newVersion) {
    return null;
  }

  return (
    <>
      {/* Compact notification bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 shadow-lg z-50 transition-all duration-300",
        showNotification ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <div>
              <p className="font-semibold">Update Available! Version {newVersion.version}</p>
              <p className="text-sm opacity-90">New features and improvements are ready</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowReleaseNotes(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              What's New
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              {isUpdating ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-bounce" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Release notes modal */}
      {showReleaseNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">What's New in v{newVersion.version}</h2>
                <button
                  onClick={() => setShowReleaseNotes(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Released on {new Date(newVersion.releaseDate).toLocaleDateString()}
              </p>
              
              {newVersion.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    New Features
                  </h3>
                  <ul className="space-y-2">
                    {newVersion.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {newVersion.fixes && newVersion.fixes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Bug Fixes
                  </h3>
                  <ul className="space-y-2">
                    {newVersion.fixes.map((fix, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Update Now'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReleaseNotes(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Update status toast */}
      {updateStatus !== 'idle' && (
        <div className={cn(
          "fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50",
          updateStatus === 'updating' && "bg-blue-500 text-white",
          updateStatus === 'success' && "bg-green-500 text-white",
          updateStatus === 'error' && "bg-red-500 text-white"
        )}>
          {updateStatus === 'updating' && 'Installing update...'}
          {updateStatus === 'success' && 'Update installed! Reloading...'}
          {updateStatus === 'error' && 'Update failed. Please try again.'}
        </div>
      )}
    </>
  );
}