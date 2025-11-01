import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Cloud, Smartphone } from 'lucide-react';

interface ConflictData {
  id: string;
  field: string;
  localValue: any;
  serverValue: any;
  lastModified: Date;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolve: (resolutions: Record<string, 'local' | 'server'>) => void;
}

export function ConflictResolutionModal({ isOpen, onClose, conflicts, onResolve }: ConflictResolutionModalProps) {
  const [selections, setSelections] = React.useState<Record<string, 'local' | 'server'>>({});

  const handleSelect = (id: string, choice: 'local' | 'server') => {
    setSelections(prev => ({ ...prev, [id]: choice }));
  };

  const handleResolveAll = () => {
    onResolve(selections);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Resolve Sync Conflicts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which version to keep for each conflicting field:
          </p>
          {conflicts.map((conflict) => (
            <Card key={conflict.id} className="p-4">
              <p className="font-medium mb-3">{conflict.field}</p>
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
                    <span className="font-medium">Local</span>
                  </div>
                  <p className="text-sm">{String(conflict.localValue)}</p>
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
                    <span className="font-medium">Server</span>
                  </div>
                  <p className="text-sm">{String(conflict.serverValue)}</p>
                </button>
              </div>
            </Card>
          ))}
          <div className="flex gap-2">
            <Button onClick={handleResolveAll} className="flex-1">
              Resolve Conflicts
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
