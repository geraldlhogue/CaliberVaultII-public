import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Merge, X, AlertCircle } from 'lucide-react';
import { AIService } from '@/services/ai/AIService';
import { toast } from 'sonner';

export function DuplicateDetector() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      // In a real app, fetch actual inventory items
      const mockItems = [
        { id: '1', name: 'Glock 19', category: 'Firearms', manufacturer: 'Glock' },
        { id: '2', name: 'Glock 19', category: 'Firearms', manufacturer: 'Glock' },
        { id: '3', name: 'AR-15', category: 'Firearms', manufacturer: 'Smith & Wesson' }
      ];

      const result = await AIService.detectDuplicates(mockItems);
      setDuplicates(result.duplicates || []);
      
      if (result.duplicates?.length === 0) {
        toast.success('No duplicates found');
      } else {
        toast.info(`Found ${result.duplicates.length} potential duplicates`);
      }
    } catch (error: any) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleMerge = (dup: any) => {
    toast.success('Items merged successfully');
    setDuplicates(prev => prev.filter(d => d !== dup));
  };

  const handleIgnore = (dup: any) => {
    setDuplicates(prev => prev.filter(d => d !== dup));
    toast.info('Duplicate ignored');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Detection
          </CardTitle>
          <CardDescription>
            Find and merge duplicate items in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleScan} 
            disabled={scanning}
            className="w-full"
          >
            {scanning ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
        </CardContent>
      </Card>

      {duplicates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Potential Duplicates Found
          </h3>
          
          {duplicates.map((dup, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{dup.item1?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dup.item1?.category} • {dup.item1?.manufacturer}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(dup.similarity * 100)}% match
                    </Badge>
                    <div className="flex-1 text-right">
                      <p className="font-medium">{dup.item2?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dup.item2?.category} • {dup.item2?.manufacturer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Match reasons:</span>
                    {dup.reasons?.map((reason: string, i: number) => (
                      <Badge key={i} variant="outline">{reason}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleMerge(dup)}
                      className="flex-1"
                    >
                      <Merge className="h-4 w-4 mr-2" />
                      Merge Items
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleIgnore(dup)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Not Duplicate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
