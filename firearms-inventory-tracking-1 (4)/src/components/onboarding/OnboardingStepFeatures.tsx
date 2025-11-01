import { Package, BarChart3, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingStepFeaturesProps {
  onNext: () => void;
  onBack: () => void;
}

const features = [
  {
    icon: Package,
    title: 'Shared Inventory',
    description: 'Access and manage your team\'s complete inventory in real-time'
  },
  {
    icon: MessageSquare,
    title: 'Collaboration',
    description: 'Comment on items, share notes, and communicate with your team'
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'View insights, reports, and track inventory trends together'
  },
  {
    icon: FileText,
    title: 'Reports',
    description: 'Generate and share detailed reports with your team'
  }
];

export function OnboardingStepFeatures({ onNext, onBack }: OnboardingStepFeaturesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Team Features</h2>
        <p className="text-muted-foreground">
          Powerful tools for collaborative inventory management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="p-4">
            <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
