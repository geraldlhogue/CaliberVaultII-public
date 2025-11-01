import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}
export function LoginModal({ open, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'Success', description: 'Logged in successfully!' });
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      const errorMsg = error.message || 'Invalid email or password';
      toast({ 
        title: 'Sign In Failed', 
        description: errorMsg,
        variant: 'destructive' 
      });
      
      // Show reset password option on credential errors
      if (errorMsg.includes('Invalid email or password')) {
        setShowResetPassword(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ 
        title: 'Email Required', 
        description: 'Please enter your email address first',
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      await resetPassword(email);
      toast({ 
        title: 'Password Reset Email Sent', 
        description: 'Check your email for reset instructions' 
      });
      setShowResetPassword(false);
    } catch (error: any) {
      toast({ 
        title: 'Reset Failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In to CaliberVault</DialogTitle>

        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-2 z-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                style={{ pointerEvents: 'auto' }}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          {showResetPassword && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetPassword}
              className="w-full"
            >
              Forgot Password? Send Reset Email
            </Button>
          )}
          
          <Button type="button" variant="link" onClick={onSwitchToSignup} className="w-full">
            Don't have an account? Sign up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

