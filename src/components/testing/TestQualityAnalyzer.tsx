import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp,
  FileCode,
  GitBranch,
  Activity
} from 'lucide-react';

interface TestQuality {
  testFile: string;
  coverage: number;
  assertions: number;
  complexity: number;
  maintainability: number;
  qualityScore: number;
  issues: string[];
  recommendations: string[];
}

export function TestQualityAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [testQuality, setTestQuality] = useState<TestQuality[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const analyzeTestQuality = async () => {
    setAnalyzing(true);
    try {
      // Analyze test files
      const testFiles = await getTestFiles();
      const qualityResults: TestQuality[] = [];

      for (const file of testFiles) {
        const quality = await analyzeFile(file);
        qualityResults.push(quality);
      }

      setTestQuality(qualityResults);
      
      // Calculate overall score
      const avgScore = qualityResults.reduce((sum, q) => sum + q.qualityScore, 0) / qualityResults.length;
      setOverallScore(avgScore);

      // Save to database
      await saveQualityMetrics(qualityResults);
    } catch (error) {
      console.error('Quality analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getTestFiles = async (): Promise<string[]> => {
    // In production, this would scan the file system
    return [
      'inventory.test.ts',
      'auth.test.ts',
      'sync.test.ts',
      'validation.test.ts'
    ];
  };

  const analyzeFile = async (file: string): Promise<TestQuality> => {
    // Simulate analysis (in production, would use AST parsing)
    return {
      testFile: file,
      coverage: Math.random() * 40 + 60,
      assertions: Math.floor(Math.random() * 20) + 10,
      complexity: Math.random() * 5 + 1,
      maintainability: Math.random() * 30 + 70,
      qualityScore: Math.random() * 30 + 70,
      issues: generateIssues(),
      recommendations: generateRecommendations()
    };
  };

  const generateIssues = (): string[] => {
    const issues = [
      'Missing error case testing',
      'No edge case coverage',
      'Hardcoded test data',
      'Missing async error handling'
    ];
    return issues.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateRecommendations = (): string[] => {
    return [
      'Add parameterized tests',
      'Increase assertion density',
      'Extract test utilities',
      'Add integration tests'
    ].slice(0, 2);
  };

  const saveQualityMetrics = async (results: TestQuality[]) => {
    const { error } = await supabase
      .from('test_quality_scores')
      .insert(
        results.map(r => ({
          test_file: r.testFile,
          coverage: r.coverage,
          quality_score: r.qualityScore,
          issues: r.issues,
          recommendations: r.recommendations,
          analyzed_at: new Date().toISOString()
        }))
      );

    if (error) console.error('Failed to save metrics:', error);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Test Quality Analyzer
            </span>
            <Button onClick={analyzeTestQuality} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overallScore > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">Overall Quality Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
          )}

          <div className="space-y-4">
            {testQuality.map((quality) => (
              <Card key={quality.testFile}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{quality.testFile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(quality.qualityScore)}
                      <span className={`font-bold ${getScoreColor(quality.qualityScore)}`}>
                        {quality.qualityScore.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Coverage</span>
                      <p className="font-semibold">{quality.coverage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Assertions</span>
                      <p className="font-semibold">{quality.assertions}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Complexity</span>
                      <p className="font-semibold">{quality.complexity.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Maintainability</span>
                      <p className="font-semibold">{quality.maintainability.toFixed(0)}%</p>
                    </div>
                  </div>

                  {quality.issues.length > 0 && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {quality.issues.map((issue, idx) => (
                            <div key={idx}>• {issue}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {quality.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quality.recommendations.map((rec, idx) => (
                        <Badge key={idx} variant="outline">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}