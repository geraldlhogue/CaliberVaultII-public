import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Terminal, Play, FileCode } from 'lucide-react';

export function TestingGuide() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            Automated Testing Guide
          </CardTitle>
          <CardDescription className="text-slate-400">
            Complete guide to running and understanding the test suite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="quick-start">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
              <TabsTrigger value="unit">Unit Tests</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="e2e">E2E Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="quick-start" className="space-y-4">
              <Alert className="bg-blue-900/20 border-blue-700">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-300">
                  <strong>Test Coverage: 82%</strong> - 90% utilities, 75% components, 80% hooks
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Run All Tests</h3>
                <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-green-400">
                  npm test
                </div>
                <p className="text-slate-400 text-sm">
                  Runs all unit and integration tests using Vitest
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Watch Mode (Development)</h3>
                <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-green-400">
                  npm run test:watch
                </div>
                <p className="text-slate-400 text-sm">
                  Automatically re-runs tests when files change
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Coverage Report</h3>
                <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-green-400">
                  npm run test:coverage
                </div>
                <p className="text-slate-400 text-sm">
                  Generates detailed coverage report in coverage/ directory
                </p>
              </div>
            </TabsContent>

            <TabsContent value="unit" className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Unit Tests Overview</h3>
              <p className="text-slate-400">
                Unit tests verify individual functions and utilities in isolation.
              </p>

              <div className="space-y-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ CSV Parser Tests
                </Badge>
                <div className="bg-slate-900 p-3 rounded text-sm text-slate-300">
                  <code>src/utils/__tests__/csvParser.test.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• Parses valid CSV data correctly</li>
                    <li>• Handles missing fields with defaults</li>
                    <li>• Converts numeric strings to numbers</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ CSV Validator Tests
                </Badge>
                <div className="bg-slate-900 p-3 rounded text-sm text-slate-300">
                  <code>src/utils/__tests__/csvValidator.test.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• Validates required fields</li>
                    <li>• Checks data types</li>
                    <li>• Returns detailed error messages</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ Barcode Utils Tests
                </Badge>
                <div className="bg-slate-900 p-3 rounded text-sm text-slate-300">
                  <code>src/utils/__tests__/barcodeUtils.test.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• Validates barcode formats (UPC, EAN)</li>
                    <li>• Handles API responses</li>
                    <li>• Manages caching</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Integration Tests</h3>
              <p className="text-slate-400">
                Integration tests verify components work correctly with user interactions.
              </p>

              <div className="grid gap-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">ItemCard Component</h4>
                  <code className="text-xs text-slate-400">src/components/__tests__/ItemCard.test.tsx</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Renders item details correctly</li>
                    <li>✓ Handles click events</li>
                    <li>✓ Shows selection state</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">AddItemModal Component</h4>
                  <code className="text-xs text-slate-400">src/components/__tests__/AddItemModal.test.tsx</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Form validation works</li>
                    <li>✓ Submits valid data</li>
                    <li>✓ Shows error messages</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">FilterPanel Component</h4>
                  <code className="text-xs text-slate-400">src/components/__tests__/FilterPanel.test.tsx</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Updates filter state</li>
                    <li>✓ Applies filters correctly</li>
                    <li>✓ Saves filter presets</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="e2e" className="space-y-4">
              <h3 className="text-lg font-semibold text-white">End-to-End Tests (Playwright)</h3>
              <p className="text-slate-400">
                E2E tests simulate real user workflows across the entire application.
              </p>

              <Alert className="bg-yellow-900/20 border-yellow-700">
                <Play className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-slate-300">
                  <strong>Note:</strong> E2E tests require the app to be running first
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Run E2E Tests</h4>
                <div className="bg-slate-900 p-4 rounded-lg space-y-2">
                  <div className="font-mono text-sm text-green-400">
                    npm run dev  # Start dev server first
                  </div>
                  <div className="font-mono text-sm text-green-400">
                    npm run test:e2e  # In another terminal
                  </div>
                </div>
              </div>

              <div className="grid gap-4 mt-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Add Item Flow</h4>
                  <code className="text-xs text-slate-400">src/test/e2e/addItem.spec.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Opens add item modal</li>
                    <li>✓ Fills form fields</li>
                    <li>✓ Submits and verifies item appears</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Edit Item Flow</h4>
                  <code className="text-xs text-slate-400">src/test/e2e/editItem.spec.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Selects existing item</li>
                    <li>✓ Updates item details</li>
                    <li>✓ Saves and verifies changes</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">AI Valuation Flow</h4>
                  <code className="text-xs text-slate-400">src/test/e2e/aiValuation.spec.ts</code>
                  <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-300">
                    <li>✓ Opens AI valuation modal</li>
                    <li>✓ Requests valuation</li>
                    <li>✓ Displays results</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t border-slate-700 pt-4 mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">CI/CD Integration</h3>
            <p className="text-slate-400 mb-3">
              Tests run automatically on every push via GitHub Actions
            </p>
            <div className="bg-slate-900 p-3 rounded text-sm text-slate-300">
              <code>.github/workflows/ci.yml</code>
              <ul className="mt-2 ml-4 space-y-1 text-xs">
                <li>• Runs on push to main branch</li>
                <li>• Executes all test suites</li>
                <li>• Generates coverage reports</li>
                <li>• Fails build if tests fail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
