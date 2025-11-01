import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface OnboardingTeamComparisonProps {
  comparisons: Array<{
    teamId: string;
    teamName: string;
    completionRate: number;
    averageTime: number;
  }>;
}

export function OnboardingTeamComparison({ comparisons }: OnboardingTeamComparisonProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 60) return <Badge className="bg-blue-500">Good</Badge>;
    if (rate >= 40) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Comparison</CardTitle>
        <CardDescription>Compare onboarding performance across teams</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Avg. Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No team data available
                </TableCell>
              </TableRow>
            ) : (
              comparisons.map((team) => (
                <TableRow key={team.teamId}>
                  <TableCell className="font-medium">{team.teamName}</TableCell>
                  <TableCell>{team.completionRate.toFixed(1)}%</TableCell>
                  <TableCell>{formatTime(team.averageTime)}</TableCell>
                  <TableCell>{getCompletionBadge(team.completionRate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
