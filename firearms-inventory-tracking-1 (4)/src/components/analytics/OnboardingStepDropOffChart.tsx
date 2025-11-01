import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OnboardingStepDropOffChartProps {
  stepDropOff: Record<string, number>;
}

export function OnboardingStepDropOffChart({ stepDropOff }: OnboardingStepDropOffChartProps) {
  const data = Object.entries(stepDropOff).map(([step, rate]) => ({
    step: step.charAt(0).toUpperCase() + step.slice(1),
    dropOffRate: rate
  }));

  const getColor = (rate: number) => {
    if (rate < 10) return '#10b981'; // green
    if (rate < 25) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step-by-Step Drop-Off Rates</CardTitle>
        <CardDescription>Percentage of users who didn't reach each step</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis label={{ value: 'Drop-off %', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Bar dataKey="dropOffRate" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.dropOffRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Good (&lt;10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Fair (10-25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Poor (&gt;25%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
