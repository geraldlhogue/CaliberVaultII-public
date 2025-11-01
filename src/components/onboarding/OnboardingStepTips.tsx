import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStepTipsProps {
  onComplete: () => void;
  onBack: () => void;
}

const tips = [
  'Use comments to communicate with your team about specific items',
  'Set up stock alerts to notify the team when inventory runs low',
  'Create custom reports to share insights with team members',
  'Use tags and categories to keep your shared inventory organized',
  'Check the activity feed to stay updated on team changes',
  'Export data regularly to maintain backups of your inventory'
];

export function OnboardingStepTips({ onComplete, onBack }: OnboardingStepTipsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tips & Best Practices</h2>
        <p className="text-muted-foreground">
          Get the most out of team collaboration
        </p>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg p-6">
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-center text-blue-900 dark:text-blue-100">
          🎉 You're all set! Start exploring and collaborating with your team.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button onClick={onComplete} className="flex-1">Complete Onboarding</Button>
      </div>
    </div>
  );
}
