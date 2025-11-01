import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Download, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function AITestGenerator() {
  const [code, setCode] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileType, setFileType] = useState<'component' | 'service' | 'hook' | 'utility'>('component');
  const [generating, setGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast.error('Please paste code to analyze');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-test-generator', {
        body: { code, filePath, fileType }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedTest(data.testCode);
        toast.success('Test suite generated successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate tests');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTest);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const testFileName = filePath.replace(/\.(tsx?|jsx?)$/, '.test.$1');
    const blob = new Blob([generatedTest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = testFileName.split('/').pop() || 'test.tsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Test file downloaded');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Test Generator
          </CardTitle>
          <CardDescription>
            Paste your code and let AI generate comprehensive test suites with full coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filePath">File Path</Label>
              <Input
                id="filePath"
                placeholder="src/components/MyComponent.tsx"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type</Label>
              <Select value={fileType} onValueChange={(v: any) => setFileType(v)}>
                <SelectTrigger id="fileType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="hook">Hook</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Source Code</Label>
            <Textarea
              id="code"
              placeholder="Paste your component or service code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generating || !code.trim()}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing & Generating Tests...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Test Suite
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Test Suite</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedTest}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}