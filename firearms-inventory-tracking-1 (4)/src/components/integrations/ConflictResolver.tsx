import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';
import { EnhancedCloudStorageService, SyncConflict } from '@/services/integrations/EnhancedCloudStorageService';
import { toast } from 'sonner';

interface Props {
  connectionId?: string | null;
}

export function ConflictResolver({ connectionId }: Props) {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    loadConflicts();
  }, [connectionId]);

  const loadConflicts = async () => {
    try {
      const data = await EnhancedCloudStorageService.getConflicts(connectionId || undefined);
      setConflicts(data);
    } catch (error: any) {
      toast.error('Failed to load conflicts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (conflictId: string, strategy: string) => {
    setResolving(conflictId);
    try {
      await EnhancedCloudStorageService.resolveConflict(conflictId, strategy);
      toast.success('Conflict resolved');
      loadConflicts();
    } catch (error: any) {
      toast.error('Failed to resolve conflict');
    } finally {
      setResolving(null);
    }
  };

  const conflictTypeLabels = {
    modified_both: 'Modified in both locations',
    deleted_local: 'Deleted locally',
    deleted_remote: 'Deleted remotely',
    type_mismatch: 'Type mismatch'
  };

  const conflictTypeColors = {
    modified_both: 'bg-yellow-500',
    deleted_local: 'bg-red-500',
    deleted_remote: 'bg-orange-500',
    type_mismatch: 'bg-purple-500'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Sync Conflicts
        </CardTitle>
        <CardDescription>
          Resolve conflicts between local and cloud files
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">No conflicts to resolve</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map(conflict => (
              <div key={conflict.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{conflict.file_path}</p>
                      <Badge className={conflictTypeColors[conflict.conflict_type]}>
                        {conflictTypeLabels[conflict.conflict_type]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(conflict.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium mb-1">Local Version</p>
                    <p className="text-xs text-muted-foreground">
                      Modified: {conflict.local_version?.modified || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size: {conflict.local_version?.size || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Remote Version</p>
                    <p className="text-xs text-muted-foreground">
                      Modified: {conflict.remote_version?.modified || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size: {conflict.remote_version?.size || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(conflict.id, 'keep_local')}
                    disabled={resolving === conflict.id}
                  >
                    Keep Local
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(conflict.id, 'keep_remote')}
                    disabled={resolving === conflict.id}
                  >
                    Keep Remote
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(conflict.id, 'keep_both')}
                    disabled={resolving === conflict.id}
                  >
                    Keep Both
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
