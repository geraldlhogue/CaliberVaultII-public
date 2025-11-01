import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Folder, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  selected?: boolean;
}

interface GenerationResult {
  path: string;
  success: boolean;
  testCode?: string;
  error?: string;
}

export function BatchTestGenerator() {
  const [fileTree, setFileTree] = useState<FileNode[]>(buildFileTree());
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentFile, setCurrentFile] = useState('');

  function buildFileTree(): FileNode[] {
    // Build tree from known source files
    const srcFiles = [
      'src/components/inventory/AddItemModal.tsx',
      'src/components/inventory/EditItemModal.tsx',
      'src/components/inventory/ItemCard.tsx',
      'src/components/inventory/FilterPanel.tsx',
      'src/services/inventory.service.ts',
      'src/services/barcode/BarcodeService.ts',
      'src/hooks/useInventoryFilters.ts',
      'src/hooks/useOfflineSync.ts',
      'src/utils/csvParser.ts',
      'src/utils/barcodeUtils.ts',
    ];

    return [{
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'directory',
          children: srcFiles.filter(f => f.includes('/components/')).map(f => ({
            name: f.split('/').pop()!,
            path: f,
            type: 'file' as const,
            selected: false
          }))
        },
        {
          name: 'services',
          path: 'src/services',
          type: 'directory',
          children: srcFiles.filter(f => f.includes('/services/')).map(f => ({
            name: f.split('/').pop()!,
            path: f,
            type: 'file' as const,
            selected: false
          }))
        },
        {
          name: 'hooks',
          path: 'src/hooks',
          type: 'directory',
          children: srcFiles.filter(f => f.includes('/hooks/')).map(f => ({
            name: f.split('/').pop()!,
            path: f,
            type: 'file' as const,
            selected: false
          }))
        },
        {
          name: 'utils',
          path: 'src/utils',
          type: 'directory',
          children: srcFiles.filter(f => f.includes('/utils/')).map(f => ({
            name: f.split('/').pop()!,
            path: f,
            type: 'file' as const,
            selected: false
          }))
        }
      ]
    }];
  }

  const toggleFileSelection = (path: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'file') {
          return { ...node, selected: !node.selected };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateTree(fileTree));
  };

  const getSelectedFiles = (nodes: FileNode[]): string[] => {
    let selected: string[] = [];
    nodes.forEach(node => {
      if (node.type === 'file' && node.selected) {
        selected.push(node.path);
      }
      if (node.children) {
        selected = [...selected, ...getSelectedFiles(node.children)];
      }
    });
    return selected;
  };

  const generateTests = async () => {
    const selectedFiles = getSelectedFiles(fileTree);
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setResults([]);

    const newResults: GenerationResult[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const filePath = selectedFiles[i];
      setCurrentFile(filePath);
      setProgress(((i + 1) / selectedFiles.length) * 100);

      try {
        // Read file content
        const response = await fetch(`/${filePath}`);
        const code = await response.text();

        // Call AI test generator
        const result = await fetch('/api/generate-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, filePath })
        });

        if (result.ok) {
          const data = await result.json();
          newResults.push({
            path: filePath,
            success: true,
            testCode: data.testCode
          });
        } else {
          newResults.push({
            path: filePath,
            success: false,
            error: 'Generation failed'
          });
        }
      } catch (error) {
        newResults.push({
          path: filePath,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setResults(newResults);
    setGenerating(false);
    setCurrentFile('');
    toast.success(`Generated ${newResults.filter(r => r.success).length} test files`);
  };

  const downloadAsZip = async () => {
    const zip = new JSZip();
    
    results.forEach(result => {
      if (result.success && result.testCode) {
        const testPath = result.path.replace(/\.(tsx?|jsx?)$/, '.test.$1');
        zip.file(testPath, result.testCode);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-suite-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
        {node.type === 'directory' ? (
          <div className="flex items-center gap-2 py-1">
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{node.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              checked={node.selected}
              onCheckedChange={() => toggleFileSelection(node.path)}
            />
            <File className="w-4 h-4 text-gray-500" />
            <span>{node.name}</span>
          </div>
        )}
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  const selectedCount = getSelectedFiles(fileTree).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Select Files</h3>
          <ScrollArea className="h-96">
            {renderFileTree(fileTree)}
          </ScrollArea>
          <div className="mt-4 flex items-center justify-between">
            <Badge>{selectedCount} files selected</Badge>
            <Button onClick={generateTests} disabled={generating || selectedCount === 0}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Generate Tests
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Progress</h3>
          {generating && (
            <div className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Generating tests for: {currentFile}
              </p>
            </div>
          )}
          {results.length > 0 && (
            <div className="space-y-4">
              <ScrollArea className="h-80">
                {results.map(result => (
                  <div key={result.path} className="flex items-center gap-2 py-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.path}</span>
                  </div>
                ))}
              </ScrollArea>
              <Button onClick={downloadAsZip} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download All Tests as ZIP
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
