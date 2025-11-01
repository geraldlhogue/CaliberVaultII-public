import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CohortAnalysisService, RetentionHeatmapData } from '@/services/analytics/CohortAnalysisService';

export function RetentionHeatmap() {
  const [data, setData] = useState<RetentionHeatmapData | null>(null);
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [periodType]);

  const loadData = async () => {
    const heatmap = await CohortAnalysisService.getRetentionHeatmap(periodType);
    setData(heatmap);
  };

  const getColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-600';
    if (rate >= 60) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    if (rate >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention Heatmap</CardTitle>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map(type => (
            <button
              key={type}
              onClick={() => setPeriodType(type)}
              className={`px-3 py-1 rounded ${periodType === type ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Cohort</th>
                  {data.periods.map(p => (
                    <th key={p} className="border p-2">{periodType} {p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort, i) => (
                  <tr key={cohort}>
                    <td className="border p-2 font-medium">{cohort}</td>
                    {data.data[i].map((rate, j) => (
                      <td key={j} className={`border p-2 text-center ${getColor(rate)} text-white`}>
                        {rate > 0 ? `${rate.toFixed(1)}%` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
