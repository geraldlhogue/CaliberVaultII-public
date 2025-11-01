import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { testDataSeeder } from '@/lib/testDataSeeder';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { Database, Loader2, Trash2 } from 'lucide-react';

export function TestDataSeeder() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [itemsPerCategory, setItemsPerCategory] = useState(5);
  const [clearExisting, setClearExisting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSeed = async () => {
    if (!user) {
      toast.error('Must be logged in to seed data');
      return;
    }

    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const seedResults = await testDataSeeder.seedAll({
        userId: user.id,
        itemsPerCategory,
        clearExisting,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResults(seedResults);
      
      toast.success('Test data seeded successfully!');
    } catch (error: any) {
      toast.error(`Seeding failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test Data Seeder
        </CardTitle>
        <CardDescription>
          Generate realistic test data for all 11 inventory categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="items">Items per Category</Label>
          <Input
            id="items"
            type="number"
            min="1"
            max="50"
            value={itemsPerCategory}
            onChange={(e) => setItemsPerCategory(parseInt(e.target.value))}
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="clear"
            checked={clearExisting}
            onCheckedChange={(checked) => setClearExisting(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="clear" className="text-sm font-normal">
            Clear existing test data before seeding
          </Label>
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Seeding data... {progress}%
            </p>
          </div>
        )}

        {results && (
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-semibold text-sm">Seeding Results:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Manufacturers: {results.manufacturers}</div>
              <div>Locations: {results.locations}</div>
              <div>Firearms: {results.firearms}</div>
              <div>Ammunition: {results.ammunition}</div>
              <div>Optics: {results.optics}</div>
              <div>Suppressors: {results.suppressors}</div>
              <div>Magazines: {results.magazines}</div>
              <div>Accessories: {results.accessories}</div>
              <div>Powder: {results.powder}</div>
              <div>Primers: {results.primers}</div>
              <div>Bullets: {results.bullets}</div>
              <div>Cases: {results.cases}</div>
              <div>Reloading: {results.reloading}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSeed} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Test Data
              </>
            )}
          </Button>
          
          {clearExisting && (
            <Button variant="destructive" disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
