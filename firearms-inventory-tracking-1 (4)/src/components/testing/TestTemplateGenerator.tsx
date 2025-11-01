import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface TestTemplateGeneratorProps {
  filePath: string;
  fileType: 'component' | 'service' | 'hook' | 'util';
}

export function TestTemplateGenerator({ filePath, fileType }: TestTemplateGeneratorProps) {
  const fileName = filePath.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || '';
  const testPath = filePath.replace('/src/', '/src/').replace('.tsx', '.test.tsx').replace('.ts', '.test.ts');
  
  const generateTemplate = () => {
    const templates = {
      component: `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  it('should render correctly', () => {
    render(<${fileName} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const mockFn = vi.fn();
    render(<${fileName} onClick={mockFn} />);
    // Add interaction tests
  });
});`,
      service: `import { describe, it, expect, beforeEach } from 'vitest';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  let service: ${fileName};

  beforeEach(() => {
    service = new ${fileName}();
  });

  it('should initialize correctly', () => {
    expect(service).toBeDefined();
  });

  it('should handle operations', async () => {
    // Add service method tests
  });
});`,
      hook: `import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => ${fileName}());
    expect(result.current).toBeDefined();
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => ${fileName}());
    act(() => {
      // Add state update tests
    });
  });
});`,
      util: `import { describe, it, expect } from 'vitest';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  it('should handle valid input', () => {
    const result = ${fileName}('valid');
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    // Add edge case tests
  });
});`
    };

    return templates[fileType];
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTemplate());
    toast.success('Test template copied to clipboard!');
  };

  const handleDownload = () => {
    const template = generateTemplate();
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = testPath.split('/').pop() || 'test.tsx';
    a.click();
    toast.success('Test template downloaded!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileCode className="h-4 w-4" />
          Generate Test for {fileName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Test Path: {testPath}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} size="sm" variant="outline">
            <Copy className="h-3 w-3 mr-1" />
            Copy Template
          </Button>
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}