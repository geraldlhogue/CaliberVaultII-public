import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Cloud, Smartphone, GitMerge, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConflictData {
  id: string;
  field: string;
  localValue: any;
  serverValue: any;
  localModified: Date;
  serverModified: Date;
  localUser?: string;
  serverUser?: string;
}

interface EnhancedConflictResolutionProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolve: (resolutions: Record<string, 'local' | 'server' | 'merge'>) => void;
}

export function EnhancedConflictResolution({ 
  isOpen, 
  onClose, 
  conflicts, 
  onResolve 
}: EnhancedConflictResolutionProps) {
  const [selections, setSelections] = useState<Record<string, 'local' | 'server' | 'merge'>>({});
  const [strategy, setStrategy] = useState<'manual' | 'newest' | 'local' | 'server'>('manual');
  const { toast } = useToast();

  const handleSelect = (id: string, choice: 'local' | 'server' | 'merge') => {
    setSelections(prev => ({ ...prev, [id]: choice }));
  };

  const applyStrategy = () => {
    const newSelections: Record<string, 'local' | 'server' | 'merge'> = {};
    
    conflicts.forEach(conflict => {
      switch (strategy) {
        case 'newest':
          newSelections[conflict.id] = 
            new Date(conflict.localModified) > new Date(conflict.serverModified) 
              ? 'local' 
              : 'server';
          break;
        case 'local':
          newSelections[conflict.id] = 'local';
          break;
        case 'server':
          newSelections[conflict.id] = 'server';
          break;
      }
    });
    
    setSelections(newSelections);
    toast({ title: 'Strategy Applied', description: `Using ${strategy} strategy` });
  };

  const handleResolveAll = () => {
    const allSelected = conflicts.every(c => selections[c.id]);
    if (!allSelected) {
      toast({ 
        title: 'Incomplete Selection', 
        description: 'Please resolve all conflicts',
        variant: 'destructive'
      });
      return;
    }
    onResolve(selections);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Resolve {conflicts.length} Sync Conflict{conflicts.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Resolution</TabsTrigger>
            <TabsTrigger value="auto">Auto Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review each conflict and choose which version to keep:
            </p>
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">{conflict.field}</p>
                  {selections[conflict.id] && (
                    <Badge variant="secondary">
                      {selections[conflict.id] === 'local' ? 'Local Selected' : 
                       selections[conflict.id] === 'server' ? 'Server Selected' : 'Merge'}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelect(conflict.id, 'local')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selections[conflict.id] === 'local'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">Local (Your Device)</span>
                    </div>
                    <p className="text-sm mb-2">{String(conflict.localValue)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(conflict.localModified).toLocaleString()}
                    </div>
                    {conflict.localUser && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        {conflict.localUser}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => handleSelect(conflict.id, 'server')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selections[conflict.id] === 'server'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-4 w-4" />
                      <span className="font-medium">Server (Cloud)</span>
                    </div>
                    <p className="text-sm mb-2">{String(conflict.serverValue)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(conflict.serverModified).toLocaleString()}
                    </div>
                    {conflict.serverUser && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        {conflict.serverUser}
                      </div>
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="auto" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Choose Resolution Strategy</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setStrategy('newest')}
                  className={`w-full p-4 border-2 rounded-lg text-left ${
                    strategy === 'newest' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Keep Newest</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically keep the most recently modified version
                  </p>
                </button>
                <button
                  onClick={() => setStrategy('local')}
                  className={`w-full p-4 border-2 rounded-lg text-left ${
                    strategy === 'local' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Keep All Local</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep all local changes from your device
                  </p>
                </button>
                <button
                  onClick={() => setStrategy('server')}
                  className={`w-full p-4 border-2 rounded-lg text-left ${
                    strategy === 'server' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="h-4 w-4" />
                    <span className="font-medium">Keep All Server</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep all server changes from the cloud
                  </p>
                </button>
              </div>
              <Button onClick={applyStrategy} className="w-full mt-4">
                Apply Strategy
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleResolveAll} className="flex-1">
            <GitMerge className="h-4 w-4 mr-2" />
            Resolve All Conflicts
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
