import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Code, Zap } from 'lucide-react';

const API_DOCS = [
  {
    category: 'Inventory',
    endpoints: [
      {
        method: 'GET',
        path: '/api/inventory',
        description: 'Get all inventory items',
        parameters: [
          { name: 'limit', type: 'integer', description: 'Number of items to return' },
          { name: 'offset', type: 'integer', description: 'Number of items to skip' }
        ],
        response: {
          data: [
            { id: 'uuid', name: 'string', category: 'string', quantity: 'integer' }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/inventory/:id',
        description: 'Get inventory item by ID',
        parameters: [
          { name: 'id', type: 'uuid', description: 'Item ID', required: true }
        ],
        response: {
          data: { id: 'uuid', name: 'string', category: 'string', quantity: 'integer' }
        }
      }
    ]
  },
  {
    category: 'Firearms',
    endpoints: [
      {
        method: 'GET',
        path: '/api/firearms',
        description: 'Get all firearms',
        parameters: [],
        response: {
          data: [
            { id: 'uuid', manufacturer: 'string', model: 'string', serial_number: 'string' }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/firearms',
        description: 'Create new firearm',
        parameters: [],
        body: {
          manufacturer: 'string',
          model: 'string',
          serial_number: 'string',
          caliber: 'string'
        },
        response: {
          data: { id: 'uuid', manufacturer: 'string', model: 'string' }
        }
      }
    ]
  }
];

export function APIDocumentationGenerator() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Documentation</h2>
        <p className="text-muted-foreground">Complete reference for CaliberVault API</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <Book className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Code className="h-4 w-4 mr-2" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="quickstart">
            <Zap className="h-4 w-4 mr-2" />
            Quick Start
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn how to use the CaliberVault API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  All API requests require an API key. Include your API key in the request header:
                </p>
                <pre className="mt-2 p-3 bg-muted rounded text-sm">
                  x-api-key: cv_your_api_key_here
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <pre className="p-3 bg-muted rounded text-sm">
                  {window.location.origin}/functions/v1/api-gateway
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  API requests are limited based on your API key configuration. Default is 1000 requests per hour.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Format</h3>
                <p className="text-sm text-muted-foreground">
                  All responses are returned in JSON format with the following structure:
                </p>
                <pre className="mt-2 p-3 bg-muted rounded text-sm">
{`{
  "data": { ... },
  "error": null
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {API_DOCS.map((category) => (
            <div key={category.category}>
              <h3 className="text-xl font-bold mb-4">{category.category}</h3>
              <div className="space-y-4">
                {category.endpoints.map((endpoint, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          endpoint.method === 'GET' ? 'default' :
                          endpoint.method === 'POST' ? 'secondary' :
                          endpoint.method === 'PUT' ? 'outline' : 'destructive'
                        }>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param, pidx) => (
                              <div key={pidx} className="text-sm">
                                <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                                <span className="text-muted-foreground ml-2">
                                  ({param.type}) {param.required && <Badge variant="outline" className="ml-1">required</Badge>}
                                </span>
                                <p className="text-muted-foreground mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.body && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                          <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(endpoint.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Response</h4>
                        <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Get up and running in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Create an API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Navigate to the API Keys tab and create a new API key with the appropriate scopes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Make Your First Request</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the API Playground to test your first request:
                </p>
                <pre className="p-3 bg-muted rounded text-sm overflow-auto">
{`curl -X GET "${window.location.origin}/functions/v1/api-gateway/api/inventory" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Handle the Response</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Parse the JSON response and use the data in your application:
                </p>
                <pre className="p-3 bg-muted rounded text-sm overflow-auto">
{`const response = await fetch(url, {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});
const { data } = await response.json();
console.log(data);`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 4: Set Up Webhooks (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Configure webhooks to receive real-time notifications when events occur in your inventory.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
