import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Check, X, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedCartridgesAndUnits } from './ReferenceDataSeederPart2';
import { seedAdditionalTables } from './ReferenceDataSeederPart3';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ReferenceDataSeederModal() {
  const [open, setOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<{ table: string; status: 'success' | 'error'; message?: string }[]>([]);
  const { toast } = useToast();

  const seedData = async () => {
    setSeeding(true);
    setResults([]);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Error', description: 'Must be logged in', variant: 'destructive' });
      setSeeding(false);
      return;
    }

    const userId = user.id;
    const newResults: typeof results = [];

    try {
      await supabase.from('categories').upsert([
        { name: 'Firearms', user_id: userId },
        { name: 'Optics', user_id: userId },
        { name: 'Ammunition', user_id: userId },
        { name: 'Accessories', user_id: userId },
        { name: 'Suppressors', user_id: userId },
        { name: 'Reloading', user_id: userId }
      ], { onConflict: 'user_id,name' });
      newResults.push({ table: 'categories', status: 'success' });
    } catch (e: any) {
      newResults.push({ table: 'categories', status: 'error', message: e.message });
    }

    try {
      await supabase.from('locations').upsert([
        { name: 'Gun Safe', user_id: userId },
        { name: 'Closet', user_id: userId },
        { name: 'Range Bag', user_id: userId },
        { name: 'Storage Unit', user_id: userId }
      ], { onConflict: 'user_id,name' });
      newResults.push({ table: 'locations', status: 'success' });
    } catch (e: any) {
      newResults.push({ table: 'locations', status: 'error', message: e.message });
    }

    try {
      await supabase.from('units_of_measure').upsert([
        { unit_code: 'in', unit_name: 'inches', category: 'length' },
        { unit_code: 'mm', unit_name: 'millimeters', category: 'length' },
        { unit_code: 'gr', unit_name: 'grains', category: 'weight' },
        { unit_code: 'rds', unit_name: 'rounds', category: 'quantity' }
      ], { onConflict: 'unit_code' });
      newResults.push({ table: 'units_of_measure', status: 'success' });
    } catch (e: any) {
      newResults.push({ table: 'units_of_measure', status: 'error', message: e.message });
    }

    await seedCartridgesAndUnits(userId, newResults);
    await seedAdditionalTables(userId, newResults);

    setResults(newResults);
    setSeeding(false);
    
    const successCount = newResults.filter(r => r.status === 'success').length;
    toast({
      title: 'Seeding Complete',
      description: `${successCount}/${newResults.length} tables seeded`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs px-2">
          <Database className="h-3 w-3 mr-1" />
          Seed Tables
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seed Reference Data</DialogTitle>
          <DialogDescription>
            Populate dropdown menus with common values like manufacturers, calibers, cartridges, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={seedData} disabled={seeding} className="w-full">
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {seeding ? 'Seeding...' : 'Start Seeding'}
          </Button>
          
          {results.length > 0 && (
            <ScrollArea className="h-64 border rounded p-2">
              <div className="space-y-1">
                {results.map((result, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {result.status === 'success' ? (
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="flex-1">{result.table}</span>
                    {result.message && <span className="text-xs text-muted-foreground">{result.message}</span>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
