import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Key, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeResult {
  barcode: string;
  name: string;
  manufacturer: string;
  category: string;
  description?: string;
  price?: number;
  image?: string;
}

export const BarcodeLookupAPI: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [testBarcode, setTestBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState('');

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    localStorage.setItem('barcode_api_key', apiKey);
    toast.success('API key saved successfully');
  };

  const handleTestLookup = async () => {
    if (!testBarcode.trim()) {
      toast.error('Please enter a barcode to test');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Simulate API call - in production, this would call the actual barcode lookup service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful result
      const mockResult: BarcodeResult = {
        barcode: testBarcode,
        name: 'Glock 19 Gen 5',
        manufacturer: 'Glock',
        category: 'firearms',
        description: '9mm Semi-Automatic Pistol',
        price: 549.99,
        image: 'https://example.com/image.jpg'
      };

      setResult(mockResult);
      toast.success('Barcode lookup successful');
    } catch (err: any) {
      setError(err.message || 'Failed to lookup barcode');
      toast.error('Barcode lookup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Barcode Lookup API</h2>
        <p className="text-slate-400">Configure and test barcode lookup integration</p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey" className="text-white">API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your barcode API key"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveApiKey}>
                    <Key className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Supported Services
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    UPC Database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Barcode Lookup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Product Database
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="space-y-4">
              <div>
                <Label htmlFor="testBarcode" className="text-white">Test Barcode</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="testBarcode"
                    value={testBarcode}
                    onChange={(e) => setTestBarcode(e.target.value)}
                    placeholder="Enter barcode to test"
                    className="flex-1"
                  />
                  <Button onClick={handleTestLookup} disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Looking up...' : 'Lookup'}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="bg-slate-900 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Lookup Result</h3>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500">
                      Success
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Barcode:</span>
                      <span className="text-white">{result.barcode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{result.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manufacturer:</span>
                      <span className="text-white">{result.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white">{result.category}</span>
                    </div>
                    {result.price && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Price:</span>
                        <span className="text-white">${result.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
