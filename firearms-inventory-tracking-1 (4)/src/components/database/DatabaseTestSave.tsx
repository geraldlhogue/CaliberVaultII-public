import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const DatabaseTestSave: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testSave = async () => {
    setTesting(true);
    setResults([]);
    const newResults: string[] = [];

    try {
      // Test 1: Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        newResults.push('❌ Not authenticated - please log in');
        setResults([...newResults]);
        setTesting(false);
        return;
      }
      newResults.push(`✅ Authenticated as: ${user.email}`);
      setResults([...newResults]);

      // Test 2: Test saving a cartridge
      const cartridgeTest = {
        cartridge: `Test Cartridge ${Date.now()}`,
        bullet_diameter: 0.308,
        user_id: user.id
      };
      
      const { data: cartridgeData, error: cartridgeError } = await supabase
        .from('cartridges')
        .insert(cartridgeTest)
        .select()
        .single();

      if (cartridgeError) {
        newResults.push(`❌ Cartridge save failed: ${cartridgeError.message}`);
      } else {
        newResults.push(`✅ Cartridge saved: ${cartridgeData.cartridge}`);
        
        // Clean up test cartridge
        await supabase.from('cartridges').delete().eq('id', cartridgeData.id);
        newResults.push('✅ Test cartridge cleaned up');
      }
      setResults([...newResults]);

      // Test 3: Test saving to inventory (new schema)
      const inventoryTest = {
        category: 'firearms',
        name: `Test Firearm ${Date.now()}`,
        manufacturer: 'Test Manufacturer',
        model: `Test Model ${Date.now()}`,
        serial_number: `TEST${Date.now()}`,
        quantity: 1,
        user_id: user.id
      };

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .insert(inventoryTest)
        .select()
        .single();

      if (inventoryError) {
        newResults.push(`❌ Inventory save failed: ${inventoryError.message}`);
      } else {
        newResults.push(`✅ Inventory item saved: ${inventoryData.name}`);
        
        // Clean up test item
        await supabase.from('inventory').delete().eq('id', inventoryData.id);
        newResults.push('✅ Test inventory item cleaned up');
      }
      setResults([...newResults]);


      // Test 4: Check database connection
      const { data: testConnection, error: connectionError } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

      if (connectionError) {
        newResults.push(`❌ Database connection failed: ${connectionError.message}`);
      } else {
        newResults.push('✅ Database connection successful');
      }
      setResults([...newResults]);

      toast.success('All database tests completed');
    } catch (error: any) {
      newResults.push(`❌ Unexpected error: ${error.message}`);
      setResults([...newResults]);
      toast.error('Database test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Database Save Test</h3>
      
      <Button 
        onClick={testSave} 
        disabled={testing}
        className="mb-4"
      >
        {testing ? 'Testing...' : 'Run Database Save Test'}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="text-sm">
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};