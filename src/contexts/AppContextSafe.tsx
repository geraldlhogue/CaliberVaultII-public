import React, { useState, useEffect } from 'react';
import { AppProvider as OriginalAppProvider } from './AppContextNew';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

export const SafeAppProvider: React.FC<Props> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Reset error on mount
    setError(null);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Failed to Initialize
          </h1>
          
          <p className="text-slate-400 text-center mb-6">
            Unable to load the application. Please check your connection and try again.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setError(null);
                setIsRetrying(true);
                setTimeout(() => setIsRetrying(false), 100);
              }}
              variant="outline"
              className="flex-1"
              disabled={isRetrying}
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <OriginalAppProvider>
        {children}
      </OriginalAppProvider>
    );
  } catch (err) {
    setError(err as Error);
    return null;
  }
};
