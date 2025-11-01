import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Award, FileCheck, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QualityStats {
  avgOverall: number;
  avgCoverage: number;
  avgEdgeCase: number;
  avgMockQuality: number;
  avgAssertion: number;
  avgBestPractices: number;
  totalTests: number;
  passingTests: number;
  trend: number;
}

export function TeamQualityDashboard() {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentScores, setRecentScores] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: scores, error } = await supabase
        .from('test_quality_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (scores && scores.length > 0) {
        const avgOverall = Math.round(
          scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length
        );
        const avgCoverage = Math.round(
          scores.reduce((sum, s) => sum + s.coverage_score, 0) / scores.length
        );
        const avgEdgeCase = Math.round(
          scores.reduce((sum, s) => sum + s.edge_case_score, 0) / scores.length
        );
        const avgMockQuality = Math.round(
          scores.reduce((sum, s) => sum + s.mock_quality_score, 0) / scores.length
        );
        const avgAssertion = Math.round(
          scores.reduce((sum, s) => sum + s.assertion_score, 0) / scores.length
        );
        const avgBestPractices = Math.round(
          scores.reduce((sum, s) => sum + s.best_practices_score, 0) / scores.length
        );

        const recentAvg = scores.slice(0, 10).reduce((sum, s) => sum + s.overall_score, 0) / 10;
        const olderAvg = scores.slice(10, 20).reduce((sum, s) => sum + s.overall_score, 0) / 10;
        const trend = recentAvg - olderAvg;

        setStats({
          avgOverall,
          avgCoverage,
          avgEdgeCase,
          avgMockQuality,
          avgAssertion,
          avgBestPractices,
          totalTests: scores.length,
          passingTests: scores.filter(s => s.overall_score >= 70).length,
          trend,
        });

        setRecentScores(scores.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading quality metrics...</div>;
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No quality data available yet</p>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Quality</p>
              <p className={`text-3xl font-bold ${getScoreColor(stats.avgOverall)}`}>
                {stats.avgOverall}
              </p>
            </div>
            <Award className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {stats.trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={stats.trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(stats.trend).toFixed(1)} points
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tests</p>
              <p className="text-3xl font-bold">{stats.totalTests}</p>
            </div>
            <FileCheck className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.passingTests} passing ({Math.round((stats.passingTests / stats.totalTests) * 100)}%)
          </p>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Quality Breakdown</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Coverage</span>
                  <span className={getScoreColor(stats.avgCoverage)}>{stats.avgCoverage}</span>
                </div>
                <Progress value={stats.avgCoverage} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Assertions</span>
                  <span className={getScoreColor(stats.avgAssertion)}>{stats.avgAssertion}</span>
                </div>
                <Progress value={stats.avgAssertion} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Test Quality Scores</h3>
        <div className="space-y-3">
          {recentScores.map((score) => (
            <div key={score.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{score.file_name}</p>
                <p className="text-xs text-muted-foreground">{score.file_path}</p>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(score.overall_score)}`}>
                {score.overall_score}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
