import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { OnboardingStepWelcome } from './OnboardingStepWelcome';
import { OnboardingStepRole } from './OnboardingStepRole';
import { OnboardingStepFeatures } from './OnboardingStepFeatures';
import { OnboardingStepTips } from './OnboardingStepTips';
import { OnboardingFeedbackModal } from './OnboardingFeedbackModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const STEP_NAMES = ['welcome', 'role', 'features', 'tips'];
const STEP_TITLES = ['Welcome', 'Your Role', 'Features', 'Tips & Best Practices'];


interface TeamMemberOnboardingProps {
  open: boolean;
  teamName: string;
  inviterName: string;
  role: string;
  permissions: string[];
  teamMemberId: string;
  onComplete: () => void;
}

export function TeamMemberOnboarding({
  open,
  teamName,
  inviterName,
  role,
  permissions,
  teamMemberId,
  onComplete
}: TeamMemberOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState(0);
  const { toast } = useToast();
  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;


  useEffect(() => {
    if (open && currentStep === 0) {
      updateOnboardingProgress(0);
    }
  }, [open]);

  const updateOnboardingProgress = async (step: number) => {
    try {
      await supabase
        .from('team_members')
        .update({
          onboarding_progress: { currentStep: step, steps: Array.from({ length: step + 1 }, (_, i) => i) },
          onboarding_started_at: step === 0 ? new Date().toISOString() : undefined
        })
        .eq('id', teamMemberId);
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  const handleNext = () => {
    // Show feedback modal before moving to next step
    setFeedbackStep(currentStep);
    setShowFeedback(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    updateOnboardingProgress(nextStep);
  };


  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleComplete = async () => {
    try {
      await supabase
        .from('team_members')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', teamMemberId);

      toast({
        title: 'Onboarding Complete!',
        description: 'Welcome to your team. Start collaborating now!'
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <Progress value={progress} className="w-full" />
            
            {currentStep === 0 && (
              <OnboardingStepWelcome
                teamName={teamName}
                inviterName={inviterName}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 1 && (
              <OnboardingStepRole
                role={role}
                permissions={permissions}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 2 && (
              <OnboardingStepFeatures
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 3 && (
              <OnboardingStepTips
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingFeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        stepName={STEP_NAMES[feedbackStep]}
        stepTitle={STEP_TITLES[feedbackStep]}
        teamMemberId={teamMemberId}
      />
    </>
  );
}

