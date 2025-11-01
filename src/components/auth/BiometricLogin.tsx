import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  registerBiometric,
  isBiometricEnabled,
} from '@/lib/biometricAuth';
import { supabase } from '@/lib/supabase';

interface BiometricLoginProps {
  onSuccess?: () => void;
  onFallback?: () => void;
}

export function BiometricLogin({ onSuccess, onFallback }: BiometricLoginProps) {
  const { user, signIn } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const available = await isBiometricAvailable();
    setIsAvailable(available);
    
    // Check if user has credentials stored
    const credential = localStorage.getItem('biometric_credential');
    setIsEnabled(!!credential);
  };

  const handleBiometricLogin = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await authenticateWithBiometric();
      
      if (result.success && result.userId) {
        // Get user email from stored credential
        const storedCredential = localStorage.getItem('biometric_credential');
        if (storedCredential) {
          const { email } = JSON.parse(storedCredential);
          
          // Sign in with Supabase using stored session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            toast.success('Authenticated with Face ID / Touch ID');
            onSuccess?.();
          } else {
            // Fallback to password login if no session
            setError('Session expired. Please login with password.');
            setTimeout(() => onFallback?.(), 2000);
          }
        }
      } else {
        setError(result.error || 'Biometric authentication failed');
        setTimeout(() => onFallback?.(), 2000);
      }
    } catch (err) {
      console.error('Biometric login error:', err);
      setError('Biometric authentication failed. Please use password login.');
      setTimeout(() => onFallback?.(), 2000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Face ID / Touch ID';
    } else if (userAgent.includes('android')) {
      return 'Fingerprint';
    }
    return 'Biometric';
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Fingerprint className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Quick Sign In</CardTitle>
        <CardDescription>
          Use {getDeviceType()} to sign in to CaliberVault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isEnabled ? (
          <>
            <Button
              onClick={handleBiometricLogin}
              disabled={isAuthenticating}
              className="w-full"
              size="lg"
            >
              <Smartphone className="mr-2 h-5 w-5" />
              {isAuthenticating ? 'Authenticating...' : `Sign in with ${getDeviceType()}`}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={onFallback}
              className="w-full"
            >
              Sign in with Password
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {getDeviceType()} is available but not set up for this account.
            </p>
            <Button
              variant="outline"
              onClick={onFallback}
              className="w-full"
            >
              Continue with Password
            </Button>
            <p className="text-xs text-muted-foreground">
              You can enable {getDeviceType()} in your profile settings after signing in.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}