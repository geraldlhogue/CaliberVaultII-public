import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface Prediction {
  type: 'price' | 'maintenance' | 'market' | 'usage';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
}

export function PredictiveAnalyticsDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: { action: 'get_predictions' }
      });

      if (!error && data?.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'price': return TrendingUp;
      case 'maintenance': return AlertTriangle;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Predictions & Insights</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {predictions.map((pred, i) => {
          const Icon = getIcon(pred.type);
          return (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {pred.title}
                  </span>
                  <Badge variant={pred.impact === 'high' ? 'destructive' : 'default'}>
                    {pred.impact}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{pred.description}</p>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Confidence</span>
                    <span>{pred.confidence}%</span>
                  </div>
                  <Progress value={pred.confidence} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
