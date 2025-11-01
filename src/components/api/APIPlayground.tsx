import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Play, Copy } from 'lucide-react';

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/inventory', description: 'Get all inventory items' },
  { method: 'GET', path: '/api/firearms', description: 'Get all firearms' },
  { method: 'GET', path: '/api/firearms/:id', description: 'Get firearm by ID' },
  { method: 'POST', path: '/api/firearms', description: 'Create new firearm' },
  { method: 'PUT', path: '/api/firearms/:id', description: 'Update firearm' },
  { method: 'DELETE', path: '/api/firearms/:id', description: 'Delete firearm' }
];

export function APIPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/functions/v1/api-gateway${selectedEndpoint.path}`;
      
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      });
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        data: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  const generateCurlCommand = () => {
    const baseUrl = window.location.origin;
    let curl = `curl -X ${selectedEndpoint.method} "${baseUrl}/functions/v1/api-gateway${selectedEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY"`;

    if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
      curl += ` \\\n  -d '${requestBody}'`;
    }

    return curl;
  };

  const generateJavaScriptCode = () => {
    const baseUrl = window.location.origin;
    return `const response = await fetch('${baseUrl}/functions/v1/api-gateway${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  }${['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) ? `,\n  body: JSON.stringify(${requestBody})` : ''}
});

const data = await response.json();
console.log(data);`;
  };

  const generatePythonCode = () => {
    const baseUrl = window.location.origin;
    return `import requests

response = requests.${selectedEndpoint.method.toLowerCase()}(
    '${baseUrl}/functions/v1/api-gateway${selectedEndpoint.path}',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY'
    }${['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) ? `,\n    json=${requestBody}` : ''}
)

print(response.json())`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Playground</h2>
        <p className="text-muted-foreground">Test API endpoints interactively</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="cv_..."
                />
              </div>

              <div>
                <Label>Endpoint</Label>
                <Select
                  value={selectedEndpoint.path}
                  onValueChange={(path) => {
                    const endpoint = API_ENDPOINTS.find(e => e.path === path);
                    if (endpoint) setSelectedEndpoint(endpoint);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_ENDPOINTS.map((endpoint) => (
                      <SelectItem key={endpoint.path} value={endpoint.path}>
                        <span className="font-mono text-sm">
                          {endpoint.method} {endpoint.path}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedEndpoint.description}
                </p>
              </div>

              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                <div>
                  <Label>Request Body</Label>
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <Button onClick={handleExecute} disabled={loading} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Executing...' : 'Execute'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96 text-sm">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Execute a request to see the response
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                      {generateCurlCommand()}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(generateCurlCommand())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="javascript" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                      {generateJavaScriptCode()}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(generateJavaScriptCode())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                      {generatePythonCode()}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(generatePythonCode())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
