import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedCartridgesAndUnits } from './ReferenceDataSeederPart2';
import { seedAdditionalTables } from './ReferenceDataSeederPart3';

export function ReferenceDataSeeder() {
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

    // Categories (CRITICAL) - Add all 11 categories
    try {
      await supabase.from('categories').upsert([
        { name: 'Firearms', user_id: userId },
        { name: 'Optics', user_id: userId },
        { name: 'Ammunition', user_id: userId },
        { name: 'Accessories', user_id: userId },
        { name: 'Suppressors', user_id: userId },
        { name: 'Magazines', user_id: userId },
        { name: 'Reloading', user_id: userId },
        { name: 'Bullets', user_id: userId },
        { name: 'Cases', user_id: userId },
        { name: 'Primers', user_id: userId },
        { name: 'Powder', user_id: userId }
      ], { onConflict: 'user_id,name' });
      newResults.push({ table: 'categories', status: 'success' });
    } catch (e: any) {
      newResults.push({ table: 'categories', status: 'error', message: e.message });
    }


    // Locations (CRITICAL)
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

    // Units (CRITICAL)
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
      description: `${successCount}/${newResults.length} tables seeded successfully`
    });
  };

  return (
    <div>
      <Button onClick={seedData} disabled={seeding} size="sm" variant="outline" className="h-6 text-xs px-2">
        {seeding && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
        Seed Tables
      </Button>

      {results.length > 0 && (
        <div className="mt-2 space-y-1 text-xs">
          {results.slice(0, 3).map((result, i) => (
            <div key={i} className="flex items-center gap-1">
              {result.status === 'success' ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-red-600" />
              )}
              <span>{result.table}</span>
            </div>
          ))}
          {results.length > 3 && (
            <div className="text-muted-foreground">+{results.length - 3} more</div>
          )}
        </div>
      )}
    </div>
  );
}

