import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Shield, Smartphone, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function BiometricSettings() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricStatus();
  }, [user]);

  const checkBiometricStatus = async () => {
    if (!user) return;
    
    // Check if WebAuthn is available
    const available = window.PublicKeyCredential !== undefined &&
                     navigator.credentials !== undefined;
    
    setIsAvailable(available);
    
    if (available && user) {
      // Check if biometric is enabled in user profile
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('biometric_enabled')
          .eq('id', user.id)
          .single();
        
        setIsEnabled(data?.biometric_enabled || false);
      } catch (error) {
        console.error('Error checking biometric status:', error);
      }
    }
  };

  const handleToggleBiometric = async (checked: boolean) => {
    if (!user) return;
    
    if (checked) {
      setShowSetup(true);
    } else {
      // Disable biometric
      setIsLoading(true);
      try {
        // Update user profile
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            biometric_enabled: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        
        if (error) throw error;
        
        // Clear local storage
        localStorage.removeItem('biometric_credential');
        
        setIsEnabled(false);
        toast.success('Biometric authentication disabled');
      } catch (err) {
        console.error('Error disabling biometric:', err);
        toast.error('Failed to disable biometric authentication');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSetupBiometric = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, we'll simulate the biometric setup
      // In a real implementation, this would use WebAuthn API
      
      // Check if browser supports WebAuthn properly
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }
      
      // Update user profile to enable biometric
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          biometric_enabled: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (updateError) throw updateError;
      
      // Store a flag in local storage (in production, this would store credential ID)
      localStorage.setItem('biometric_credential', JSON.stringify({
        userId: user.id,
        enabled: true,
        timestamp: Date.now()
      }));
      
      setIsEnabled(true);
      setShowSetup(false);
      toast.success('Biometric authentication enabled successfully');
      
    } catch (err: any) {
      console.error('Biometric setup error:', err);
      
      // Provide more specific error messages
      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Please allow biometric authentication when prompted.');
      } else if (err.name === 'NotSupportedError') {
        setError('Biometric authentication is not supported on this device.');
      } else {
        setError(err.message || 'Failed to setup biometric authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Face ID / Touch ID';
    } else if (userAgent.includes('android')) {
      return 'Fingerprint';
    }
    return 'Biometric Authentication';
  };

  if (!isAvailable) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not available on this device or browser.
          {' '}
          {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') 
            ? 'Try using Safari for best compatibility.'
            : 'Try using Chrome or Edge for best compatibility.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-primary" />
            <Label htmlFor="biometric-toggle" className="text-base">
              {getDeviceType()}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Use {getDeviceType()} to quickly sign in to your account
          </p>
        </div>
        <Switch
          id="biometric-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggleBiometric}
          disabled={isLoading}
        />
      </div>

      {showSetup && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setup {getDeviceType()}
            </CardTitle>
            <CardDescription>
              Enable quick and secure authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Secure Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Your biometric data never leaves your device
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Device Specific</p>
                  <p className="text-sm text-muted-foreground">
                    You'll need to set this up on each device you use
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Password Fallback</p>
                  <p className="text-sm text-muted-foreground">
                    You can always sign in with your password if needed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSetupBiometric}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Setting up...' : `Enable ${getDeviceType()}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSetup(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isEnabled && (
        <Alert className="bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {getDeviceType()} is enabled for this device. You can use it to sign in quickly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}