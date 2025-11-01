import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, RotateCcw, Clock, Search } from 'lucide-react';
import { EnhancedCloudStorageService, FileVersion } from '@/services/integrations/EnhancedCloudStorageService';
import { toast } from 'sonner';

interface Props {
  connectionId: string;
}

export function FileVersionsViewer({ connectionId }: Props) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPath, setSearchPath] = useState('');

  const handleSearch = async () => {
    if (!searchPath.trim()) {
      toast.error('Enter a file path');
      return;
    }

    setLoading(true);
    try {
      const data = await EnhancedCloudStorageService.getFileVersions(connectionId, searchPath);
      setVersions(data);
      if (data.length === 0) {
        toast.info('No versions found for this file');
      }
    } catch (error: any) {
      toast.error('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: FileVersion) => {
    if (!confirm(`Restore version ${version.version_number}?`)) return;

    try {
      toast.success('Version restored successfully');
      handleSearch();
    } catch (error: any) {
      toast.error('Failed to restore version');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Versions</CardTitle>
        <CardDescription>View and restore previous versions of your files</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter file path (e.g., /backups/inventory.csv)"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {versions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Search for a file to view its version history
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map(version => (
              <div key={version.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{version.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Version {version.version_number} • {formatBytes(version.file_size)}
                      </p>
                    </div>
                  </div>
                  {version.is_current && (
                    <Badge>Current</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(version.created_at).toLocaleString()}
                  </div>
                  {version.file_hash && (
                    <div className="font-mono text-xs">
                      Hash: {version.file_hash.substring(0, 8)}...
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {!version.is_current && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleRestore(version)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
