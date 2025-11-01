import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { SecurityService } from '@/services/security/SecurityService';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (setupData?.qrCode) {
      QRCode.toDataURL(setupData.qrCode).then(setQrCodeUrl);
    }
  }, [setupData]);

  const loadStatus = async () => {
    const { data } = await SecurityService.get2FAStatus();
    setIsEnabled(data?.is_enabled || false);
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const data = await SecurityService.setup2FA();
      setSetupData(data);
      toast.success('2FA setup initiated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await SecurityService.verify2FA(verificationCode, setupData.secret);
      if (result.valid) {
        toast.success('2FA enabled successfully');
        setIsEnabled(true);
        setSetupData(null);
        setVerificationCode('');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    setLoading(true);
    try {
      await SecurityService.disable2FA();
      toast.success('2FA disabled');
      setIsEnabled(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is enabled on your account.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is not enabled. Enable it to secure your account.
            </AlertDescription>
          </Alert>
        )}

        {!isEnabled && !setupData && (
          <Button onClick={handleSetup} disabled={loading}>
            Enable 2FA
          </Button>
        )}

        {setupData && (
          <div className="space-y-4">
            <div>
              <Label>Scan QR Code</Label>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="mt-2 border rounded" />
              )}
            </div>

            <div>
              <Label>Or enter this code manually</Label>
              <div className="flex gap-2 mt-2">
                <Input value={setupData.secret} readOnly />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(setupData.secret)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>Backup Codes (Save these securely)</Label>
              <div className="mt-2 p-4 bg-muted rounded font-mono text-sm">
                {setupData.backupCodes?.map((code: string, i: number) => (
                  <div key={i}>{code}</div>
                ))}
              </div>
            </div>

            <div>
              <Label>Verification Code</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6}>
              Verify and Enable
            </Button>
          </div>
        )}

        {isEnabled && (
          <Button variant="destructive" onClick={handleDisable} disabled={loading}>
            Disable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
