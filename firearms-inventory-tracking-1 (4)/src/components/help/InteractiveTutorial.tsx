import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
}

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of CaliberVault',
    steps: [
      { id: '1', title: 'Welcome', description: 'Welcome to CaliberVault! This tutorial will guide you through the basics.' },
      { id: '2', title: 'Dashboard', description: 'The dashboard shows your inventory summary and quick stats.', target: '.dashboard-stats' },
      { id: '3', title: 'Add Item', description: 'Click the "Add Item" button to add firearms, optics, ammo, and more.', target: '[data-tutorial="add-item"]' },
      { id: '4', title: 'Categories', description: 'Use category cards to filter by type: Firearms, Optics, Ammunition, etc.', target: '.category-cards' },
      { id: '5', title: 'Search', description: 'Use the search bar to quickly find items by name, model, or serial number.', target: '[data-tutorial="search"]' }
    ]
  },
  {
    id: 'add-firearm',
    name: 'Adding a Firearm',
    description: 'Step-by-step guide to add your first firearm',
    steps: [
      { id: '1', title: 'Open Add Modal', description: 'Click "Add Item" and select "Firearms" category.' },
      { id: '2', title: 'Basic Info', description: 'Enter manufacturer, model, and serial number.' },
      { id: '3', title: 'Details', description: 'Add caliber, barrel length, and other specifications.' },
      { id: '4', title: 'Photos', description: 'Take or upload photos of your firearm.' },
      { id: '5', title: 'Save', description: 'Click "Add Firearm" to save to your inventory.' }
    ]
  }
];

export function InteractiveTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedTutorial && selectedTutorial.steps[currentStep]?.target) {
      const element = document.querySelector(selectedTutorial.steps[currentStep].target!) as HTMLElement;
      setHighlightedElement(element);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, selectedTutorial]);

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const completeTutorial = () => {
    setSelectedTutorial(null);
    setCurrentStep(0);
    setHighlightedElement(null);
  };

  const progress = selectedTutorial ? ((currentStep + 1) / selectedTutorial.steps.length) * 100 : 0;

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">Start Tutorial</Button>

      {isOpen && !selectedTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Interactive Tutorials</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X /></Button>
            </div>
            <div className="space-y-4">
              {tutorials.map(tutorial => (
                <Card key={tutorial.id} className="p-4 hover:bg-accent cursor-pointer" onClick={() => startTutorial(tutorial)}>
                  <h3 className="font-semibold">{tutorial.name}</h3>
                  <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tutorial.steps.length} steps</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedTutorial && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
          <Card className="fixed bottom-4 right-4 w-96 p-6 pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{selectedTutorial.steps[currentStep].title}</h3>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {selectedTutorial.steps.length}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={completeTutorial}><X /></Button>
            </div>
            <Progress value={progress} className="mb-4" />
            <p className="text-sm mb-6">{selectedTutorial.steps[currentStep].description}</p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <Button onClick={nextStep}>{currentStep === selectedTutorial.steps.length - 1 ? <><Check className="mr-2 h-4 w-4" />Finish</> : <><ArrowRight className="mr-2 h-4 w-4" />Next</>}</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
