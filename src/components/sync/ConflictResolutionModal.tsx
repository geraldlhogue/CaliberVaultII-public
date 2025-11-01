import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataConflict, ConflictResolution } from '@/services/sync/ConflictResolver';
import { Clock } from 'lucide-react';

interface ConflictResolutionModalProps {
  conflict: DataConflict | null;
  open: boolean;
  onResolve: (resolution: ConflictResolution) => void;
  onClose: () => void;
}

export function ConflictResolutionModal({ conflict, open, onResolve, onClose }: ConflictResolutionModalProps) {
  if (!conflict) return null;

  const handleUseServer = () => {
    onResolve({
      action: 'use-server',
      data: conflict.serverData,
      reason: 'User chose server version',
    });
  };

  const handleUseClient = () => {
    onResolve({
      action: 'use-client',
      data: conflict.localData,
      reason: 'User chose local version',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Data Conflict Detected</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The same item was modified both locally and on the server. Choose which version to keep.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Local Version</h3>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(conflict.localTimestamp).toLocaleString()}
                </Badge>
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(conflict.localData, null, 2)}
              </pre>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Server Version</h3>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(conflict.serverTimestamp).toLocaleString()}
                </Badge>
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(conflict.serverData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={handleUseClient}>Use Local</Button>
          <Button onClick={handleUseServer}>Use Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
