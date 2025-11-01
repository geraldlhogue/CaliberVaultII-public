import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OnboardingTrendsChartProps {
  trends: Array<{
    date: string;
    invitations: number;
    acceptances: number;
    completions: number;
  }>;
}

export function OnboardingTrendsChart({ trends }: OnboardingTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Trends Over Time</CardTitle>
        <CardDescription>Track invitation, acceptance, and completion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="invitations" 
              stroke="#8884d8" 
              name="Invitations Sent"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="acceptances" 
              stroke="#82ca9d" 
              name="Acceptances"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="#ffc658" 
              name="Completions"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
