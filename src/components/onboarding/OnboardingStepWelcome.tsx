import { Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStepWelcomeProps {
  teamName: string;
  inviterName: string;
  onNext: () => void;
}

export function OnboardingStepWelcome({ teamName, inviterName, onNext }: OnboardingStepWelcomeProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome to {teamName}!</h2>
        <p className="text-muted-foreground text-lg">
          {inviterName} has invited you to collaborate on CaliberVault
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          You're now part of a collaborative team! Work together to manage your inventory, 
          share insights, and stay organized.
        </p>
      </div>

      <Button onClick={onNext} size="lg" className="w-full">
        Get Started
      </Button>
    </div>
  );
}
