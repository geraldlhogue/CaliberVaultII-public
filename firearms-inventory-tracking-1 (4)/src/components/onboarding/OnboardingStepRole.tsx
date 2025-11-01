import { Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OnboardingStepRoleProps {
  role: string;
  permissions: string[];
  onNext: () => void;
  onBack: () => void;
}

const roleDescriptions: Record<string, string> = {
  admin: 'Full access to all features, settings, and team management',
  member: 'Can view and edit inventory, collaborate with team',
  viewer: 'Read-only access to inventory and reports'
};

export function OnboardingStepRole({ role, permissions, onNext, onBack }: OnboardingStepRoleProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Role & Permissions</h2>
        <p className="text-muted-foreground">
          Understanding what you can do in this team
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
        <Badge className="mb-3 capitalize">{role}</Badge>
        <p className="text-sm mb-4">{roleDescriptions[role] || 'Team member with standard access'}</p>
        
        <div className="space-y-2">
          <p className="font-semibold text-sm">Your Permissions:</p>
          {permissions.slice(0, 5).map((perm) => (
            <div key={perm} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="capitalize">{perm.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
