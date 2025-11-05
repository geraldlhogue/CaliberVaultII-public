import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileNode {
  name: string;
  path: string;
  coverage?: number;
  children?: FileNode[];
  isDirectory?: boolean;
}

interface CoverageFileTreeProps {
  files: Record<string, any>;
  onFileSelect: (path: string) => void;
}

export function CoverageFileTree({ files, onFileSelect }: CoverageFileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src']));

  const buildTree = (): FileNode[] => {
    const root: Record<string, FileNode> = {};
    
    Object.entries(files).forEach(([path, data]) => {
      const parts = path.split('/');
      let current = root;
      
      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, idx + 1).join('/'),
            isDirectory: idx < parts.length - 1,
            children: []
          };
        }
        
        if (idx === parts.length - 1) {
          current[part].coverage = data.lines?.pct || 0;
        }
        
        if (current[part].children) {
          current = current[part].children!.reduce((acc, child) => {
            acc[child.name] = child;
            return acc;
          }, {} as Record<string, FileNode>);
        }
      });
    });

    return Object.values(root);
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.path);
    
    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-muted rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleExpand(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.isDirectory ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : null}
          {node.isDirectory ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />}
          <span className="text-sm flex-1">{node.name}</span>
          {node.coverage !== undefined && (
            <Badge variant="outline" className="text-xs">
              {node.coverage.toFixed(0)}%
            </Badge>
          )}
        </div>
        {node.isDirectory && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">File Coverage</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {buildTree().map(node => renderNode(node))}
      </CardContent>
    </Card>
  );
}